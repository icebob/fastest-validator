"use strict";

const flatten = require("./helpers/flatten");
const deepExtend = require("./helpers/deep-extend");
const defaultMessages = require("./messages");

function loadRules() {
	return {
		any: require("./rules/any"),
		array: require("./rules/array"),
		boolean: require("./rules/boolean"),
		custom: require("./rules/custom"),
		date: require("./rules/date"),
		email: require("./rules/email"),
		enum: require("./rules/enum"),
		forbidden: require("./rules/forbidden"),
		function: require("./rules/function"),
		number: require("./rules/number"),
		object: require("./rules/object"),
		string: require("./rules/string"),
		url: require("./rules/url"),
		uuid: require("./rules/uuid"),
		mac: require("./rules/mac"),
		luhn: require("./rules/luhn")
	};
}

// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

// Regex to escape quoted property names for eval/new Function
const escapeEvalRegex = /["'\\\n\r\u2028\u2029]/g;

function escapeEvalString(str) {
	// Based on https://github.com/joliss/js-string-escape
	return str.replace(escapeEvalRegex, function(character) {
		switch (character) {
		case "\"":
		case "'":
		case "\\":
			return "\\" + character;
			// Four possible LineTerminator characters need to be escaped:
		case "\n":
			return "\\n";
		case "\r":
			return "\\r";
		case "\u2028":
			return "\\u2028";
		case "\u2029":
			return "\\u2029";
		}
	});
}

/**
 * Validator class constructor
 *
 * @param {Object} opts
 */
function Validator(opts) {
	this.opts = {
		messages: deepExtend({}, defaultMessages)
	};

	if (opts)
		deepExtend(this.opts, opts);

	this.messages = this.opts.messages;
	this.messageKeys = Object.keys(this.messages);

	// Load rules
	this.rules = loadRules();
	this.cache = new Map();
}

/**
 * Validate an object by schema
 *
 * @param {Object} obj
 * @param {Object} schema
 */
Validator.prototype.validate = function(obj, schema) {
	const check = this.compile(schema);
	return check(obj);
};

/**
 * Compile a schema
 *
 * @param {Object} schema
 * @throws {Error} Invalid schema
 */
Validator.prototype.compile = function(schema) {
	const self = this;
	if (Array.isArray(schema)) {
	// Multiple schemas
		if (schema.length == 0) {
			throw new Error("If the schema is an Array, must contain at least one element!");
		}

		const rules = this.compileSchemaType(schema);
		this.cache.clear();
		return function(value, path, parent) {
			return self.checkSchemaType(value, rules, path, parent || null);
		};
	}

	const rule = this.compileSchemaObject(schema);
	this.cache.clear();
	return function(value, path, parent) {
		return self.checkSchemaObject(value, rule, path, parent || null);
	};
};

Validator.prototype.compileSchemaObject = function(schemaObject) {
	if (schemaObject === null || typeof schemaObject !== "object" || Array.isArray(schemaObject)) {
		throw new Error("Invalid schema!");
	}

	let compiledObject = this.cache.get(schemaObject);
	if (compiledObject) {
		compiledObject.cycle = true;
		return compiledObject;
	} else {
		compiledObject = { cycle: false, properties: null, compiledObjectFunction: null, objectStack: [] };
		this.cache.set(schemaObject, compiledObject);
	}

	compiledObject.properties = Object.keys(schemaObject)
		.filter(name => {
			return name !== "$$strict";
		})
		.map(name => {
			const compiledType = this.compileSchemaType(schemaObject[name]);
			return { name: name, compiledType: compiledType };
		});

	const sourceCode = [];
	sourceCode.push("let res;");
	sourceCode.push("let propertyPath;");
	sourceCode.push("const errors = [];");

	if (schemaObject.$$strict === true) {
		sourceCode.push("const givenProps = new Map(Object.keys(value).map(key => [key, true]));");
	}

	for (let i = 0; i < compiledObject.properties.length; i++) {
		const property = compiledObject.properties[i];
		const name = escapeEvalString(property.name);
		const propertyValueExpr = identifierRegex.test(name) ? `value.${name}` : `value["${name}"]`;

		sourceCode.push(`propertyPath = (path !== undefined ? path + ".${name}" : "${name}");`);
		if (Array.isArray(property.compiledType)) {
			sourceCode.push(`res = this.checkSchemaType(${propertyValueExpr}, properties[${i}].compiledType, propertyPath, value);`);
		} else {
			sourceCode.push(`res = this.checkSchemaRule(${propertyValueExpr}, properties[${i}].compiledType, propertyPath, value);`);
		}
		sourceCode.push("if (res !== true) {");
		sourceCode.push(`\tthis.handleResult(errors, propertyPath, res, properties[${i}].compiledType.messages);`);
		sourceCode.push("}");

		if (schemaObject.$$strict === true) {
			sourceCode.push(`givenProps.delete("${name}");`);
		}
	}

	if (schemaObject.$$strict === true) {
		sourceCode.push("if (givenProps.size !== 0) {");
		sourceCode.push("\tthis.handleResult(errors, path || 'rootObject', this.makeError('objectStrict', undefined, [...givenProps.keys()].join(', ')), this.messages);");
		sourceCode.push("}");
	}

	sourceCode.push("return errors.length === 0 ? true : errors;");

	compiledObject.compiledObjectFunction = new Function("value", "properties", "path", "parent", sourceCode.join("\n"));

	return compiledObject;
};

Validator.prototype.compileSchemaType = function(schemaType) {

	if (Array.isArray(schemaType)) {

		// Multiple rules, flatten to array of compiled SchemaRule
		const rules = flatten(schemaType.map(r => this.compileSchemaType(r)));

		if (rules.length == 1) {
			return rules[0];
		}

		return rules;
	}

	return this.compileSchemaRule(schemaType);

};

Validator.prototype.compileMessages = function(schemaType) {
	if (schemaType.messages)
		return Object.assign({}, this.messages, schemaType.messages);

	return this.messages;
};

Validator.prototype.compileSchemaRule = function(schemaRule) {

	if (typeof schemaRule === "string") {
		schemaRule = {
			type: schemaRule
		};
	}

	const ruleFunction = this.rules[schemaRule.type];

	if (!ruleFunction) {
		throw new Error("Invalid '" + schemaRule.type + "' type in validator schema!");
	}

	const messages = this.compileMessages(schemaRule);

	let dataParameter = null;
	let dataFunction = null;

	if (schemaRule.type === "object" && schemaRule.props) {
		dataParameter = this.compileSchemaObject(schemaRule.props);
		dataFunction = this.checkSchemaObject;
	} else if (schemaRule.type === "array" && schemaRule.items) {
		dataParameter = this.compileSchemaType(schemaRule.items);
		dataFunction = this.checkSchemaArray;
	}

	return {
		messages: messages,
		schemaRule: schemaRule,
		ruleFunction: ruleFunction,
		dataFunction: dataFunction,
		dataParameter: dataParameter
	};
};

Validator.prototype.checkSchemaObject = function(value, compiledObject, path, parent) {
	if (compiledObject.cycle) {
		if (compiledObject.objectStack.indexOf(value) !== -1) {
			return true;
		}

		compiledObject.objectStack.push(value);
		const result = this.checkSchemaObjectInner(value, compiledObject, path, parent);
		compiledObject.objectStack.pop();
		return result;
	} else {
		return this.checkSchemaObjectInner(value, compiledObject, path, parent);
	}
};

Validator.prototype.checkSchemaObjectInner = function(value, compiledObject, path, parent) {
	return compiledObject.compiledObjectFunction.call(this, value, compiledObject.properties, path, parent);

	/*
    // Reference implementation of the object checker

    const errors = [];
    const propertiesLength = compiledObject.properties.length;
    for (let i = 0; i < propertiesLength; i++) {
    const property = compiledObject.properties[i];
    const propertyPath = (path !== undefined ? path + "." : "") + property.name;
    const res = this.checkSchemaType(value[property.name], property.compiledType, propertyPath, value);

    if (res !== true) {
    this.handleResult(errors, propertyPath, res);
    }
    }

    return errors.length === 0 ? true : errors;
    */
};

Validator.prototype.checkSchemaType = function(value, compiledType, path, parent) {

	if (Array.isArray(compiledType)) {

		const errors = [];
		const checksLength = compiledType.length;
		for (let i = 0; i < checksLength; i++) {
			// Always compiled to list of rules
			const res = this.checkSchemaRule(value, compiledType[i], path, parent);

			if (res !== true) {
				this.handleResult(errors, path, res, compiledType.messages);
			} else {
				// Jump out after first success and clear previous errors
				return true;
			}
		}

		return errors;
	}

	return this.checkSchemaRule(value, compiledType, path, parent);
};

Validator.prototype.checkSchemaArray = function(value, compiledArray, path, parent) {
	const errors = [];
	const valueLength = value.length;

	for (let i = 0; i < valueLength; i++) {
		const itemPath = (path !== undefined ? path : "") + "[" + i + "]";
		const res = this.checkSchemaType(value[i], compiledArray, itemPath, value, parent);

		if (res !== true) {
			this.handleResult(errors, itemPath, res, compiledArray.messages);
		}
	}

	return errors.length === 0 ? true : errors;
};

Validator.prototype.checkSchemaRule = function(value, compiledRule, path, parent) {
	const schemaRule = compiledRule.schemaRule;

	if (value === undefined || value === null) {
		if (schemaRule.type === "forbidden")
			return true;

		if (schemaRule.optional === true)
			return true;

		const errors = [];
		this.handleResult(errors, path, this.makeError("required"), compiledRule.messages);

		return errors;
	}

	const res = compiledRule.ruleFunction.call(this, value, schemaRule, path, parent);

	if (res !== true) {
		const errors = [];
		this.handleResult(errors, path, res, compiledRule.messages);

		return errors;
	}

	if (compiledRule.dataFunction !== null) {
		return compiledRule.dataFunction.call(this, value, compiledRule.dataParameter, path, parent);
	}

	return true;
};

/**
 * Handle results from validator functions
 *
 * @param {Array} errors
 * @param {String} fieldPath
 * @param {Array|Object} res
 */
Validator.prototype.handleResult = function(errors, fieldPath, res, messages) {
	let items;
	if (!Array.isArray(res))
		items = [res];
	else
		items = res;

	items.forEach(err => {
		if (!err.field)
			err.field = fieldPath;
		if (!err.message)
			err.message = this.resolveMessage(err, messages[err.type]);

		errors.push(err);
	});
};

/**
 * Create a validation error object
 *
 * @param {String} type
 * @param {Any} expected
 * @param {Any} actual
 */
Validator.prototype.makeError = function(type, expected, actual) {
	return {
		type: type,
		expected: expected,
		actual: actual
	};
};

/**
 * Resolve message string from a validation error object
 *
 * @param {Object} err Validation error object
 */
Validator.prototype.resolveMessage = function(err, msg = null) {

	if (msg != null) {
		const expected = err.expected != null ? err.expected : "";
		const actual = err.actual != null ? err.actual : "";
		return msg.replace(/\{field\}/g, err.field).replace(/\{expected\}/g, expected).replace(/\{actual\}/g, actual);
	}
};

/**
 * Add a custom validator rule
 *
 * @param {String} type
 * @param {Function} fn
 */
Validator.prototype.add = function(type, fn) {
	this.rules[type] = fn;
};

module.exports = Validator;
