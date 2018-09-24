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
		uuid: require("./rules/uuid")
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
		return function(value, path, parent, converted) {
			return self.checkSchemaType(value, rules, path, parent || null, converted);
		};
	}

	const rule = this.compileSchemaObject(schema);
	this.cache.clear();
	return function(value, path, parent, converted) {
		return self.checkSchemaObject(value, rule, path, parent || null, converted);
	};
};

Validator.prototype.compileSchemaObject = function(schemaObject) {
	if (schemaObject === null || typeof schemaObject !== "object" || Array.isArray(schemaObject)) {
		throw new Error("Invalid schema!");
	}

	const strict = schemaObject.$$strict;
	delete schemaObject.$$strict;

	let compiledObject = this.cache.get(schemaObject);
	if (compiledObject) {
		compiledObject.cycle = true;
		return compiledObject;
	} else {
		compiledObject = { cycle: false, properties: null, compiledObjectFunction: null, objectStack: [] };
		this.cache.set(schemaObject, compiledObject);
	}

	compiledObject.properties = Object.keys(schemaObject).map(name => {
		const compiledType = this.compileSchemaType(schemaObject[name]);
		return { name: name, compiledType: compiledType };
	});

	const sourceCode = [];
	this.generateCheckSchemaObject(sourceCode, compiledObject.properties, strict);

	compiledObject.compiledObjectFunction = new Function("value", "properties", "path", "parent", "converted", sourceCode.join("\n"));

	return compiledObject;
};

Validator.prototype.generateCheckSchemaObject = function(sourceCode, properties, strict) {

	sourceCode.push("let res;");
	sourceCode.push("let propertyPath;");
	sourceCode.push("let propertyResult;");
	sourceCode.push("const errors = [];");	
	sourceCode.push("const result = converted !== undefined ? {} : undefined;");

	if (strict === true) {
		sourceCode.push("const givenProps = new Map(Object.keys(value).map(key => [key, true]));");
	}

	for (let i = 0; i < properties.length; i++) {
		const property = properties[i];
		const name = escapeEvalString(property.name);
		const propertyValueExpr = identifierRegex.test(name) ? `.${name}` : `["${name}"]`;

		sourceCode.push(`propertyPath = (path !== undefined ? path + ".${name}" : "${name}");`);

		sourceCode.push("propertyResult = converted !== undefined ? {} : undefined;");

		if (Array.isArray(property.compiledType)) {
			sourceCode.push(`res = this.checkSchemaType(value${propertyValueExpr}, properties[${i}].compiledType, propertyPath, value, propertyResult);`);
		} else {
			sourceCode.push(`res = this.checkSchemaRule(value${propertyValueExpr}, properties[${i}].compiledType, propertyPath, value, propertyResult);`);
		}

		sourceCode.push("if (res !== true) {");
		sourceCode.push(`\tthis.handleResult(errors, propertyPath, res, properties[${i}].compiledType.messages);`);
		sourceCode.push("} else if (converted !== undefined) {");
		sourceCode.push("\tif (propertyResult.value !== undefined) {");
		sourceCode.push(`\t\tresult${propertyValueExpr} = propertyResult.value;`);
		sourceCode.push("\t} else {");
		sourceCode.push(`\t\tif (value${propertyValueExpr} !== undefined && value${propertyValueExpr} !== null) {`);
		sourceCode.push(`\t\t\tresult${propertyValueExpr} = propertyValue;`);
		sourceCode.push("\t\t}");
		sourceCode.push("\t}");
		sourceCode.push("}");

		if (strict === true) {
			sourceCode.push(`givenProps.delete("${name}");`);
		}
	}

	if (strict === true) {
		sourceCode.push("if (givenProps.size !== 0) {");
		sourceCode.push("\tthis.handleResult(errors, path || 'rootObject', this.makeError('objectStrict', undefined, [...givenProps.keys()].join(', ')), this.messages);");
		sourceCode.push("}");
	}

	sourceCode.push("if (errors.length > 0) {");
	sourceCode.push("\treturn errors;");
	sourceCode.push("}");

	sourceCode.push("if (converted !== undefined) {");
	sourceCode.push("\tconverted.value = result;");
	sourceCode.push("}");

	sourceCode.push("return true;");
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

	if (schemaType.messages) {
		return this.messageKeys.reduce((a, key) => {
			a[key] = schemaType.messages[key] || this.messages[key];
			return a;
		}, {});
	}

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

Validator.prototype.checkSchemaObject = function(value, compiledObject, path, parent, converted) {
	if (compiledObject.cycle) {
		if (compiledObject.objectStack.indexOf(value) !== -1) {
			return true;
		}

		compiledObject.objectStack.push(value);
		const result = this.checkSchemaObjectInner(value, compiledObject, path, parent, converted);
		compiledObject.objectStack.pop();
		return result;
	} else {
		return this.checkSchemaObjectInner(value, compiledObject, path, parent, converted);
	}
};

Validator.prototype.checkSchemaObjectInner = function(value, compiledObject, path, parent, converted) {
	return compiledObject.compiledObjectFunction.call(this, value, compiledObject.properties, path, parent, converted);

	/*
    // Reference implementation of the object checker

	const errors = [];
	const result = converted !== undefined ? {} : undefined;
	for (let i = 0; i < compiledObject.properties.length; i++) {
		const property = compiledObject.properties[i];
		const propertyPath = (path !== undefined ? path + "." : "") + property.name;
		const propertyResult = converted !== undefined ? {} : undefined;
		const res = this.checkSchemaType(value[property.name], property.compiledType, propertyPath, value, propertyResult);

		if (res !== true) {
			this.handleResult(errors, propertyPath, res);
		} else if (converted !== undefined) {
			if (propertyResult.value !== undefined) {
				result[property.name] = propertyResult.value;
			} else {
				const propertyValue = value[property.name];
				if (propertyValue !== undefined && propertyValue !== null) {
					result[property.name] = propertyValue;
				}
			}
		}
	}

	if (errors.length > 0) {
		return errors;
	}

	if (converted !== undefined) {
		converted.value = result;
	}

	return true;
	*/
};

Validator.prototype.checkSchemaType = function(value, compiledType, path, parent, converted) {

	if (Array.isArray(compiledType)) {

		const errors = [];
		const checksLength = compiledType.length;
		for (let i = 0; i < checksLength; i++) {
			// Always compiled to list of rules
			const res = this.checkSchemaRule(value, compiledType[i], path, parent, converted);

			if (res !== true) {
				this.handleResult(errors, path, res, compiledType.messages);
			} else {
				// Jump out after first success and clear previous errors
				return true;
			}
		}

		return errors;
	}

	return this.checkSchemaRule(value, compiledType, path, parent, converted);
};

Validator.prototype.checkSchemaArray = function(value, compiledArray, path, parent, converted) {
	const errors = [];
	const result = converted !== undefined ? [] : undefined;
	const valueLength = value.length;
	for (let i = 0; i < valueLength; i++) {
		const itemPath = (path !== undefined ? path : "") + "[" + i + "]";
		const itemResult = converted !== undefined ? {} : undefined;
		const res = this.checkSchemaType(value[i], compiledArray, itemPath, value, itemResult);

		if (res === true) {
			if (converted !== undefined) {
				result.push(itemResult.value !== undefined ? itemResult.value : value[i]);
			}
		} else {
			this.handleResult(errors, itemPath, res, compiledArray.messages);
		}
	}

	if (converted !== undefined) {
		converted.value = result;
	}

	return errors.length === 0 ? true : errors;
};

Validator.prototype.checkSchemaRule = function(value, compiledRule, path, parent, converted) {
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

	const res = compiledRule.ruleFunction.call(this, value, schemaRule, path, parent, converted);

	if (res !== true) {
		const errors = [];
		this.handleResult(errors, path, res, compiledRule.messages);

		return errors;
	}

	if (compiledRule.dataFunction !== null) {
		return compiledRule.dataFunction.call(this, value, compiledRule.dataParameter, path, parent, converted);
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
