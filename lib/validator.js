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
		equal: require("./rules/equal"),
		forbidden: require("./rules/forbidden"),
		function: require("./rules/function"),
		multi: require("./rules/multi"),
		number: require("./rules/number"),
		object: require("./rules/object"),
		string: require("./rules/string"),
		url: require("./rules/url"),
		uuid: require("./rules/uuid"),
		mac: require("./rules/mac"),
		luhn: require("./rules/luhn")
	};
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
	if (schema === null || typeof schema !== "object" || Array.isArray(schema)) {
		throw new Error("Invalid schema!");
	}

	const self = this;
	const context = {
		index: 1,
		customs: {},
		level: 0
	};

	if (schema.$$root !== true) {
		if (Array.isArray(schema)) {
			schema = {
				type: "multi",
				rules: schema
			};
		} else {
			schema = {
				type: "object",
				strict: schema.$$strict,
				properties: schema
			};
		}
	}

	const sourceCode = [
		"const errors = [];",
		"let value = data;",
	];

	const rule = this.compileSchemaRule(schema);
	const res = rule.ruleFunction.call(this, rule.schema, null, rule.messages, context);
	if (res.source)
		sourceCode.push(res.source);

	sourceCode.push("if (errors.length) {");
	sourceCode.push(`
		return errors.map(err => {
			if (err.message)
				err.message = err.message
					.replace(/\\{field\\}/g, err.field || "")
					.replace(/\\{expected\\}/g, err.expected != null ? err.expected : "")
					.replace(/\\{actual\\}/g, err.actual != null ? err.actual : "");

			return err;
		});
	`);

	sourceCode.push("}");
	sourceCode.push("return true;");

	const src = sourceCode.join("\n");

	if (this.opts.debug) {
		console.log(require("./helpers/prettier")(src));
	}

	const checkFn = Function("data", "context", src);
	return function(data) {
		return checkFn.call(self, data, context);
	};
};

Validator.prototype.compileSchemaRule = function(schema) {

	if (typeof schema === "string") {
		schema = {
			type: schema
		};
	} else if (Array.isArray(schema)) {
		schema = {
			type: "multi",
			rules: schema
		};
	}

	const ruleFunction = this.rules[schema.type];
	if (!ruleFunction)
		throw new Error("Invalid '" + schema.type + "' type in validator schema!");

	return {
		messages: Object.assign({}, this.messages, schema.messages),
		schema: schema,
		ruleFunction: ruleFunction
	};
};

Validator.prototype.makeError = function({ type, field, expected, actual, messages }) {
	const o = {
		type: `"${type}"`,
		message: `"${messages[type]}"`,
	};
	if (field) o.field = `"${field}"`;
	if (expected) o.expected = expected;
	if (actual) o.actual = actual;

	const s = Object.keys(o)
		.map(key => `${key}: ${o[key]}`)
		.join(", ");

	return `errors.push({ ${s} });`;
};

/**
 * Handle results from validator functions
 *
 * @param {Array} errors
 * @param {String} fieldPath
 * @param {Array|Object} res
 */
Validator.prototype.humanizeErrors = function(errors) {
	return errors.map(err => {
		if (!err.message)
			err.message = this.resolveMessage(err, this.opts.messages[err.type]);

		return err;
	});
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
