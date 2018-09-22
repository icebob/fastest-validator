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
	if (Array.isArray(schema)) {
		// Multiple schemas
		if (schema.length == 0) {
			throw new Error("If the schema is an Array, must contain at least one element!");
		}

		return this.compileSchemaType(schema);
	} 

	return this.compileSchemaObject(schema);
};

Validator.prototype.compileSchemaObject = function(schemaObject) {
	if (schemaObject === null || typeof schemaObject !== "object" || Array.isArray(schemaObject)) {
		throw new Error("Invalid schema!");
	}
	
	const self = this;
	const checks = Object.keys(schemaObject).map(name => ({name: name, fn: this.compileSchemaType(schemaObject[name])}));

	return function(value, _, path, parent) {
		const errors = [];
		const checksLength = checks.length;
		for (let i = 0; i < checksLength; i++) {
			const check = checks[i];
			const propertyPath = (path !== undefined ? path + "." : "") + check.name;
			const res = check.fn(value[check.name], undefined, propertyPath, value);

			if (res !== true) {
				self.handleResult(errors, propertyPath, res);
			}
		}

		return errors.length === 0 ? true : errors;
	};
};

Validator.prototype.compileSchemaType = function(schemaType) {
	if (Array.isArray(schemaType)) {
		// Multiple rules
		const self = this;
		const checks = schemaType.map(r => this.compileSchemaType(r));

		return function(value, _, path, parent) {
			const errors = [];
			const checksLength = checks.length;
			for (let i = 0; i < checksLength; i++) {
				const res = checks[i](value, undefined, path, parent);

				if (res !== true) {
					self.handleResult(errors, path, res);
				} else {
					// Jump out after first success and clear previous errors
					return true;
				}
			}

			return errors;
		};
	}

	return this.compileSchemaRule(schemaType);
};

Validator.prototype.compileSchemaRule = function(schemaRule) {
	if (typeof schemaRule === "string") {
		schemaRule = {
			type: schemaRule
		};
	}

	const checkRule = this.rules[schemaRule.type];
	if (!checkRule) {
		throw new Error("Invalid '" + schemaRule.type + "' type in validator schema!");
	}

	const self = this;
	let checkContents = null;

	if (schemaRule.type === "object") {
		if (schemaRule.props) {
			checkContents = this.compileSchemaObject(schemaRule.props);
		}
	} else if (schemaRule.type === "array") {
		if (schemaRule.items) {
			checkContents = this.compileSchemaArray(schemaRule.items);
		}
	}

	return function(value, _, path, parent) {
		const errors = [];
		if (value === undefined || value === null) {
			if (schemaRule.type === "forbidden")
				return true;

			if (schemaRule.optional === true)
				return true;

			self.handleResult(errors, path, self.makeError("required"));
			return errors;
		}

		const res = checkRule.call(self, value, schemaRule, path, parent);
		if (res !== true) {
			self.handleResult(errors, path, res);
			return errors;
		}

		if (checkContents !== null) {
			return checkContents(value, undefined, path, parent);
		}

		return true;
	}
};

Validator.prototype.compileSchemaArray = function(schemaType) {
	const self = this;
	const checkArrayItem = this.compileSchemaType(schemaType);

	return function (value, _, path, parent) {
		const errors = [];
		const valueLength = value.length;
		for (let i = 0; i < valueLength; i++) {
			const arrayItemPath = (path !== undefined ? path : "") + "[" + i + "]";
			const res = checkArrayItem(value[i], undefined, arrayItemPath, value);

			if (res !== true) {
				self.handleResult(errors, arrayItemPath, res);
			}
		}

		return errors.length === 0 ? true : errors;
	}
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
