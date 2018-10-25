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
		url: require("./rules/url")
	};
}

/**
 * Validator class constructor
 *
 * @param {Object} opts
 */
function Validator(opts) {
	this.opts = {
		messages: defaultMessages
	};

	if (opts)
		deepExtend(this.opts, opts);

	this.messages = this.opts.messages;

	// Load rules
	this.rules = loadRules();
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
		return function(value) {
			return self.checkSchemaType(value, rules, undefined, null);
		};
	} 

	const rule = this.compileSchemaObject(schema);
	return function(value) {
		return self.checkSchemaObject(value, rule, undefined, null);
	};
};

Validator.prototype.compileSchemaObject = function(schemaObject) {
	if (schemaObject === null || typeof schemaObject !== "object" || Array.isArray(schemaObject)) {
		throw new Error("Invalid schema!");
	}

	const compiledObject = Object.keys(schemaObject).map(name => {
		const compiledType = this.compileSchemaType(schemaObject[name]);
		return {name: name, compiledType: compiledType};
	});

	// Uncomment this line to use compiled object validator:
	// return compiledObject;

	const sourceCode = [];
	sourceCode.push("let res;");
	sourceCode.push("let propertyPath;");
	sourceCode.push("const errors = [];");
	for (let i = 0; i < compiledObject.length; i++) {
		const property = compiledObject[i];
		const name = property.name;
		sourceCode.push(`propertyPath = (path !== undefined ? path + ".${name}" : "${name}");`);
		if (Array.isArray(property.compiledType)) {
			sourceCode.push(`res = this.checkSchemaType(value.${name}, compiledObject[${i}].compiledType, propertyPath, value);`);
		} else {
			sourceCode.push(`res = this.checkSchemaRule(value.${name}, compiledObject[${i}].compiledType, propertyPath, value);`);
		}
		sourceCode.push("if (res !== true) {");
		sourceCode.push("\tthis.handleResult(errors, propertyPath, res);");
		sourceCode.push("}");
	}

	sourceCode.push("return errors.length === 0 ? true : errors;");

	const compiledObjectFunction = new Function("value", "compiledObject", "path", "parent", sourceCode.join("\n"));

	const self = this;
	return function(value, _unused, path, parent) {
		return compiledObjectFunction.call(self, value, compiledObject, path, parent);
	};
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
		schemaRule: schemaRule,
		ruleFunction: ruleFunction,
		dataFunction: dataFunction,
		dataParameter: dataParameter
	};
};

Validator.prototype.checkSchemaObject = function(value, compiledObject, path, parent) {
	if (compiledObject instanceof Function) {
		return compiledObject(value, undefined, path, parent);
	}

	const errors = [];
	const checksLength = compiledObject.length;
	for (let i = 0; i < checksLength; i++) {
		const check = compiledObject[i];
		const propertyPath = (path !== undefined ? path + "." : "") + check.name;
		const res = this.checkSchemaType(value[check.name], check.compiledType, propertyPath, value);

		if (res !== true) {
			this.handleResult(errors, propertyPath, res);
		}
	}

	return errors.length === 0 ? true : errors;
};

Validator.prototype.checkSchemaType = function(value, compiledType, path, parent) {
	if (Array.isArray(compiledType)) {
		const errors = [];
		const checksLength = compiledType.length;
		for (let i = 0; i < checksLength; i++) {
			// Always compiled to list of rules
			const res = this.checkSchemaRule(value, compiledType[i], path, parent);

			if (res !== true) {
				this.handleResult(errors, path, res);
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
			this.handleResult(errors, itemPath, res);
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
		this.handleResult(errors, path, this.makeError("required"));
		return errors;
	}

	const res = compiledRule.ruleFunction.call(this, value, schemaRule, path, parent);
	if (res !== true) {
		const errors = [];
		this.handleResult(errors, path, res);
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
Validator.prototype.handleResult = function(errors, fieldPath, res) {
	let items;
	if (!Array.isArray(res))
		items = [res];
	else
		items = res;

	items.forEach(err => {
		if (!err.field)
			err.field = fieldPath;
		if (!err.message)
			err.message = this.resolveMessage(err);

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
Validator.prototype.resolveMessage = function(err) {
	let msg = this.messages[err.type];
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
