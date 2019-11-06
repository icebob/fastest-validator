"use strict";

//const flatten = require("./helpers/flatten");
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

Validator.prototype.wrapRequiredCheckSourceCode = function(rule, innerSrc) {
	const src = [];
	// Required, optional, forbidden
	if (rule.schema.optional === true || rule.schema.type == "forbidden") {
		// Optional field
		src.push(`
		if (value === undefined || value === null) {
			// Do nothing, it's an optional field
		} else {`);
	} else {
		// Required field
		src.push(`
		if (value === undefined || value === null) {
			${this.makeError({ type: "required", actual: "value", messages: rule.messages })}
		} else {`);
	}

	if (innerSrc)
		src.push(innerSrc);

	src.push("\t\t}"); // Required, optional

	return src.join("\n");
};

/**
 * Compile a schema
 *
 * @param {Object} schema
 * @throws {Error} Invalid schema
 */
Validator.prototype.compile = function(schema) {
	if (schema === null || typeof schema !== "object") {
		throw new Error("Invalid schema.");
	}

	const self = this;
	const context = {
		index: 0,
		rules: [],
		fn: [],
		customs: {}
	};
	this.cache.clear();

	if (schema.$$root !== true) {
		if (Array.isArray(schema)) {
			const rule = this.getRuleFromSchema(schema);
			schema = rule.schema;
		} else {
			const prevSchema = Object.assign({}, schema);
			schema = {
				type: "object",
				strict: prevSchema.$$strict,
				properties: prevSchema
			};

			delete prevSchema.$$strict;
		}
	}

	const sourceCode = [
		"var errors = [];",
		"var field;",
	];

	const rule = this.getRuleFromSchema(schema);
	sourceCode.push(this.compileRule(rule, context, null, "context.fn[%%INDEX%%](value, field, null, errors, context);"));
	/*
	context.rules[context.index] = rule;
	const res = rule.ruleFunction.call(this, rule, null, context);
	if (res.source) {
		const fn = new Function("value", "field", "parent", "errors", "context", res.source);
		context.fn[context.index] = fn;
		sourceCode.push(this.wrapRequiredCheckSourceCode(rule, `
			context.fn[${context.index}](value, field, null, errors, context);
		`));

	} else {
		sourceCode.push(this.wrapRequiredCheckSourceCode(rule));
	}
	context.index++;
	*/

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

	const checkFn = new Function("value", "context", src);

	/* istanbul ignore next */
	if (this.opts.debug) {
		let formatter = function(code) { return code;};
		if (typeof window === "undefined") // eslint-disable-line no-undef
			formatter = require("./helpers/prettier");

		context.fn.forEach((fn, i) => console.log(`// Context.fn[${i}]\n`, formatter(fn.toString()))); // eslint-disable-line no-console
		console.log("// Main check function\n", formatter(checkFn.toString())); // eslint-disable-line no-console
	}

	this.cache.clear();

	return function(data) {
		context.data = data;
		return checkFn.call(self, data, context);
	};
};

Validator.prototype.compileRule = function(rule, context, path, innerSrc) {
	const sourceCode = [];

	const item = this.cache.get(rule.schema);
	if (item) {
		rule = item;
		rule.cycle = true;
		rule.cycleStack = [];
		sourceCode.push(this.wrapRequiredCheckSourceCode(rule, `
			var rule = context.rules[${rule.index}];
			if (rule.cycleStack.indexOf(value) === -1) {
				rule.cycleStack.push(value);
				${innerSrc.replace("%%INDEX%%", rule.index)}
				rule.cycleStack.pop(value);
			}
		`));

	} else {
		this.cache.set(rule.schema, rule);
		rule.index = context.index;
		context.rules[context.index] = rule;
		context.index++;
		const res = rule.ruleFunction.call(this, rule, path, context);
		if (res.source) {
			const fn = new Function("value", "field", "parent", "errors", "context", res.source);
			context.fn[rule.index] = fn;
			sourceCode.push(this.wrapRequiredCheckSourceCode(rule, innerSrc.replace("%%INDEX%%", rule.index)));
		} else {
			sourceCode.push(this.wrapRequiredCheckSourceCode(rule));
		}
	}

	return sourceCode.join("\n");
};

Validator.prototype.getRuleFromSchema = function(schema) {
	if (typeof schema === "string") {
		schema = {
			type: schema
		};
	} else if (Array.isArray(schema)) {
		if (schema.length == 0)
			throw new Error("Invalid schema.");

		schema = {
			type: "multi",
			rules: schema
		};
	}

	const ruleFunction = this.rules[schema.type];
	if (!ruleFunction)
		throw new Error("Invalid '" + schema.type + "' type in validator schema.");

	const rule = {
		messages: Object.assign({}, this.messages, schema.messages),
		schema: schema,
		ruleFunction: ruleFunction
	};

	return rule;
};

Validator.prototype.makeError = function({ type, field, expected, actual, messages }) {
	const o = {
		type: `"${type}"`,
		message: `"${messages[type]}"`,
	};
	if (field) o.field = `"${field}"`;
	else o.field = "field";
	if (expected) o.expected = expected;
	if (actual) o.actual = actual;

	const s = Object.keys(o)
		.map(key => `${key}: ${o[key]}`)
		.join(", ");

	return `errors.push({ ${s} });`;
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
