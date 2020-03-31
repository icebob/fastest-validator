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
 * Fastest Validator
 */
class Validator {

	/**
	 * Validator class constructor
	 *
	 * @param {Object} opts
	 */
	constructor(opts) {
		this.opts = {
			messages: deepExtend({}, defaultMessages)
		};
		this.defaults = {};

		if (opts) {
			deepExtend(this.opts, opts);
			if (opts.defaults) deepExtend(this.defaults, opts.defaults);
		}

		this.messages = this.opts.messages;

		// Load rules
		this.rules = loadRules();
		this.aliases = {};
		this.cache = new Map();
	}

	/**
	 * Validate an object by schema
	 *
	 * @param {Object} obj
	 * @param {Object} schema
	 * @returns {Array<Object>|boolean}
	 */
	validate(obj, schema) {
		const check = this.compile(schema);
		return check(obj);
	}

	/**
	 * Wrap a source code with `required` & `optional` checker codes.
	 * @param {Object} rule
	 * @param {String} innerSrc
	 * @param {String?} resVar
	 * @returns {String}
	 */
	wrapRequiredCheckSourceCode(rule, innerSrc, resVar) {
		const src = [];
		const defaultValue = rule.schema.default != null ? JSON.stringify(rule.schema.default) : null;

		// Required, optional, forbidden
		src.push(`
			if (value === undefined || value === null) {
		`);
		if (rule.schema.optional === true || rule.schema.type == "forbidden") {
			// Optional field
			if (defaultValue != null && resVar) {
				src.push(`${resVar} = ${defaultValue};`);
			} else {
				src.push("// Do nothing, it's an optional field");
			}
		} else {
			// Required field
			if (defaultValue != null && resVar) {
				src.push(`${resVar} = ${defaultValue};`);
			} else {
				src.push(this.makeError({ type: "required", actual: "value", messages: rule.messages }));
			}
		}
		src.push("} else {");

		if (innerSrc)
			src.push(innerSrc);

		src.push("\t\t}"); // Required, optional

		return src.join("\n");
	}

	/**
	 * Compile a schema
	 *
	 * @param {Object} schema
	 * @throws {Error} Invalid schema
	 * @returns {Function}
	 */
	compile(schema) {
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
		sourceCode.push(this.compileRule(rule, context, null, "context.fn[%%INDEX%%](value, field, null, errors, context);", "value"));

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
			let formatter = function(code) { return code; };
			if (typeof window === "undefined") // eslint-disable-line no-undef
				formatter = require("./helpers/prettier");

			context.fn.forEach((fn, i) => console.log(formatter(`// Context.fn[${i}]\n` + fn.toString()))); // eslint-disable-line no-console
			console.log(formatter("// Main check function\n" + checkFn.toString())); // eslint-disable-line no-console
		}

		this.cache.clear();

		return function(data) {
			context.data = data;
			return checkFn.call(self, data, context);
		};
	}

	/**
	 * Compile a rule to source code.
	 * @param {Object} rule
	 * @param {Object} context
	 * @param {String} path
	 * @param {String} innerSrc
	 * @param {String} resVar
	 * @returns {String}
	 */
	compileRule(rule, context, path, innerSrc, resVar) {
		const sourceCode = [];

		const item = this.cache.get(rule.schema);
		if (item) {
			// Handle cyclic schema
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
			`, resVar));

		} else {
			this.cache.set(rule.schema, rule);
			rule.index = context.index;
			context.rules[context.index] = rule;
			if (typeof rule.schema.custom === "function") {
				context.customs[path] = { schema: rule.schema, messages: rule.messages };
				rule.customValidation = value => `
					const rule = context.customs["${path}"];
					const res = rule.schema.custom.call(this, ${value}, rule.schema, "${path}", parent, context);
					if (Array.isArray(res)) {
						res.forEach(err => errors.push(Object.assign({ message: rule.messages[err.type], field }, err)));
					}
				`;
			}

			context.index++;
			const res = rule.ruleFunction.call(this, rule, path, context);
			if (res.source) {
				const fn = new Function("value", "field", "parent", "errors", "context", res.source);
				context.fn[rule.index] = fn;
				sourceCode.push(this.wrapRequiredCheckSourceCode(rule, innerSrc.replace("%%INDEX%%", rule.index), resVar));
			} else {
				sourceCode.push(this.wrapRequiredCheckSourceCode(rule));
			}
		}

		return sourceCode.join("\n");
	}

	/**
	 * Create a rule instance from schema definition.
	 * @param {Object} schema
	 * @returns {Object} rule
	 */
	getRuleFromSchema(schema) {
		if (typeof schema === "string") {
			const str = schema;
			const p = str.split("|").map(s => s.trim());
			schema = {
				type: p[0]
			};
			p.slice(1).map(s => {
				const idx = s.indexOf(":");
				if (idx !== -1) {
					const key = s.substr(0, idx).trim();
					let value = s.substr(idx + 1).trim();
					if (value === "true" || value === "false")
						value = value === "true";
					else if (!Number.isNaN(Number(value))) {
						value = Number(value);
					}
					schema[key] = value;
				} else {
					// boolean value
					if (s.startsWith("no-"))
						schema[s.slice(3)] = false;
					else
						schema[s] = true;
				}
			});

		} else if (Array.isArray(schema)) {
			if (schema.length == 0)
				throw new Error("Invalid schema.");

			schema = {
				type: "multi",
				rules: schema
			};

			// Check 'optional' flag
			const isOptional = schema.rules
				.map(s => this.getRuleFromSchema(s))
				.every(rule => rule.schema.optional == true);
			if (isOptional)
				schema.optional = true;
		}

		const alias = this.aliases[schema.type];
		if (alias) {
			delete schema.type;
			schema = deepExtend(schema, alias, { skipIfExist: true });
		}

		const ruleFunction = this.rules[schema.type];
		if (!ruleFunction)
			throw new Error("Invalid '" + schema.type + "' type in validator schema.");

		const rule = {
			messages: Object.assign({}, this.messages, schema.messages),
			schema: deepExtend(schema, this.defaults[schema.type], { skipIfExist: true }),
			ruleFunction: ruleFunction,
			customValidation: () => ""
		};

		return rule;
	}

	/**
	 * Generate error source code.
	 * @param {Object} opts
	 * @param {String} opts.type
	 * @param {String} opts.field
	 * @param {any} opts.expected
	 * @param {any} opts.actual
	 * @param {Object} opts.messages
	 */
	makeError({ type, field, expected, actual, messages }) {
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
	}

	/**
	 * Add a custom rule
	 *
	 * @param {String} type
	 * @param {Function} fn
	 */
	add(type, fn) {
		this.rules[type] = fn;
	}

	/**
	 * create alias name for a rule
	 *
	 * @param {String} name
	 * @param validationRule
	 */
	alias(name, validationRule) {
		if (this.rules[name]) throw new Error("Alias name must not be a rule name");
		this.aliases[name] = validationRule;
	}
}

module.exports = Validator;
