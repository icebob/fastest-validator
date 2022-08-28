"use strict";

let AsyncFunction;
try {
	AsyncFunction = (new Function("return Object.getPrototypeOf(async function(){}).constructor"))();
} catch(err) { /* async is not supported */}

const deepExtend = require("./helpers/deep-extend");
const replace = require("./helpers/replace");

function loadMessages() {
	return Object.assign({} , require("./messages"));
}

function loadRules() {
	return {
		any: require("./rules/any"),
		array: require("./rules/array"),
		boolean: require("./rules/boolean"),
		class: require("./rules/class"),
		custom: require("./rules/custom"),
		currency: require("./rules/currency"),
		date: require("./rules/date"),
		email: require("./rules/email"),
		enum: require("./rules/enum"),
		equal: require("./rules/equal"),
		forbidden: require("./rules/forbidden"),
		function: require("./rules/function"),
		multi: require("./rules/multi"),
		number: require("./rules/number"),
		object: require("./rules/object"),
		objectID: require("./rules/objectID"),
		record: require("./rules/record"),
		string: require("./rules/string"),
		tuple: require("./rules/tuple"),
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
		this.opts = {};
		this.defaults = {};
		this.messages = loadMessages();
		this.rules = loadRules();
		this.aliases = {};
		this.cache = new Map();

		if (opts) {
			deepExtend(this.opts, opts);
			if (opts.defaults) deepExtend(this.defaults, opts.defaults);

			if (opts.messages) {
				for (const messageName in opts.messages) this.addMessage(messageName, opts.messages[messageName]);
			}

			if (opts.aliases) {
				for (const aliasName in opts.aliases) this.alias(aliasName, opts.aliases[aliasName]);
			}

			if (opts.customRules) {
				for (const ruleName in opts.customRules) this.add(ruleName, opts.customRules[ruleName]);
			}

			if (opts.plugins) {
				const plugins = opts.plugins;
				if (!Array.isArray(plugins)) throw new Error("Plugins type must be array");
				plugins.forEach(this.plugin.bind(this));
			}

			/* istanbul ignore next */
			if (this.opts.debug) {
				let formatter = function (code) { return code; };
				if (typeof window === "undefined") {
					formatter = require("./helpers/prettier");
				}

				this._formatter = formatter;
			}
		}
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
	wrapRequiredCheckSourceCode(rule, innerSrc, context, resVar) {
		const src = [];
		let handleNoValue;

		let skipUndefinedValue = rule.schema.optional === true || rule.schema.type === "forbidden";
		let skipNullValue = rule.schema.optional === true || rule.schema.nullable === true || rule.schema.type === "forbidden";

		if (rule.schema.default != null) {
			// We should set default-value when value is undefined or null, not skip! (Except when null is allowed)
			skipUndefinedValue = false;
			if (rule.schema.nullable !== true) skipNullValue = false;

			let defaultValue;
			if (typeof rule.schema.default === "function") {
				if (!context.customs[rule.index]) context.customs[rule.index] = {};
				context.customs[rule.index].defaultFn = rule.schema.default;
				defaultValue = `context.customs[${rule.index}].defaultFn.call(this, context.rules[${rule.index}].schema, field, parent, context)`;
			} else {
				defaultValue = JSON.stringify(rule.schema.default);
			}

			handleNoValue = `
				value = ${defaultValue};
				${resVar} = value;
			`;

		} else {
			handleNoValue = this.makeError({ type: "required", actual: "value", messages: rule.messages });
		}


		src.push(`
			${`if (value === undefined) { ${skipUndefinedValue ? "\n// allow undefined\n" : handleNoValue} }`}
			${`else if (value === null) { ${skipNullValue ? "\n// allow null\n" : handleNoValue} }`}
			${innerSrc ? `else { ${innerSrc} }` : ""}
		`);
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
			async: schema.$$async === true,
			rules: [],
			fn: [],
			customs: {},
			utils: {
				replace,
			},
		};
		this.cache.clear();
		delete schema.$$async;

		/* istanbul ignore next */
		if (context.async && !AsyncFunction) {
			throw new Error("Asynchronous mode is not supported.");
		}

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
			"var parent = null;",
			`var label = ${schema.label ? "\"" + schema.label + "\"" : "null"};`
		];

		const rule = this.getRuleFromSchema(schema);
		sourceCode.push(this.compileRule(rule, context, null, `${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, null, errors, context, label);`, "value"));

		sourceCode.push("if (errors.length) {");
		sourceCode.push(`
			return errors.map(err => {
				if (err.message) {
					err.message = context.utils.replace(err.message, /\\{field\\}/g, err.label || err.field);
					err.message = context.utils.replace(err.message, /\\{expected\\}/g, err.expected);
					err.message = context.utils.replace(err.message, /\\{actual\\}/g, err.actual);
				}
				if(!err.label) delete err.label
				return err;
			});
		`);

		sourceCode.push("}");
		sourceCode.push("return true;");

		const src = sourceCode.join("\n");

		const FnClass = context.async ? AsyncFunction : Function;
		const checkFn = new FnClass("value", "context", src);

		/* istanbul ignore next */
		if (this.opts.debug) {
			console.log(this._formatter("// Main check function\n" + checkFn.toString())); // eslint-disable-line no-console
		}

		this.cache.clear();

		const resFn = function (data, opts) {
			context.data = data;
			if (opts && opts.meta)
				context.meta = opts.meta;
			return checkFn.call(self, data, context);
		};
		resFn.async = context.async;
		return resFn;
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
					${innerSrc.replace(/%%INDEX%%/g, rule.index)}
					rule.cycleStack.pop(value);
				}
			`, context, resVar));

		} else {
			this.cache.set(rule.schema, rule);
			rule.index = context.index;
			context.rules[context.index] = rule;

			const customPath = path != null ? path : "$$root";

			context.index++;
			const res = rule.ruleFunction.call(this, rule, path, context);
			res.source = res.source.replace(/%%INDEX%%/g, rule.index);
			const FnClass = context.async ? AsyncFunction : Function;
			const fn = new FnClass("value", "field", "parent", "errors", "context", "label", res.source);
			context.fn[rule.index] = fn.bind(this);
			sourceCode.push(this.wrapRequiredCheckSourceCode(rule, innerSrc.replace(/%%INDEX%%/g, rule.index), context, resVar));
			sourceCode.push(this.makeCustomValidator({vName: resVar, path: customPath, schema: rule.schema, context, messages: rule.messages, ruleIndex: rule.index}));

			/* istanbul ignore next */
			if (this.opts.debug) {
				console.log(this._formatter(`// Context.fn[${rule.index}]\n` + fn.toString())); // eslint-disable-line no-console
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
		schema = this.resolveType(schema);

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
		};

		return rule;
	}

	/**
	 * Parse rule from shorthand string
	 * @param {String} str shorthand string
	 * @param {Object} schema schema reference
	 */

	parseShortHand(str) {
		const p = str.split("|").map((s) => s.trim());
		let type = p[0];
		let schema;
		if (type.endsWith("[]")) {
			schema = this.getRuleFromSchema({ type: "array", items: type.slice(0, -2) }).schema;
		} else {
			schema = {
				type: p[0],
			};
		}

		p.slice(1).map((s) => {
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
				if (s.startsWith("no-")) schema[s.slice(3)] = false;
				else schema[s] = true;
			}
		});

		return schema;
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
		if (expected != null) o.expected = expected;
		if (actual != null) o.actual = actual;
		o.label = "label";

		const s = Object.keys(o)
			.map(key => `${key}: ${o[key]}`)
			.join(", ");

		return `errors.push({ ${s} });`;
	}

	/**
	 * Generate custom validator function source code.
	 * @param {Object} opts
	 * @param {String} opts.vName
	 * @param {String} opts.fnName
	 * @param {String} opts.ruleIndex
	 * @param {String} opts.path
	 * @param {Object} opts.schema
	 * @param {Object} opts.context
 	 * @param {Object} opts.messages
	 */
	makeCustomValidator({ vName = "value", fnName = "custom", ruleIndex, path, schema, context, messages }) {
		const ruleVName = "rule" + ruleIndex;
		const fnCustomErrorsVName = "fnCustomErrors" + ruleIndex;
		if (typeof schema[fnName] == "function") {
			if (context.customs[ruleIndex]) {
				context.customs[ruleIndex].messages = messages;
				context.customs[ruleIndex].schema = schema;
			}
			else context.customs[ruleIndex] = { messages, schema };

			if (this.opts.useNewCustomCheckerFunction) {
				return `
               		const ${ruleVName} = context.customs[${ruleIndex}];
					const ${fnCustomErrorsVName} = [];
					${vName} = ${context.async ? "await " : ""}${ruleVName}.schema.${fnName}.call(this, ${vName}, ${fnCustomErrorsVName} , ${ruleVName}.schema, "${path}", parent, context);
					if (Array.isArray(${fnCustomErrorsVName} )) {
                  		${fnCustomErrorsVName} .forEach(err => errors.push(Object.assign({ message: ${ruleVName}.messages[err.type], field }, err)));
					}
				`;
			}

			const result = "res_" + ruleVName;
			return `
				const ${ruleVName} = context.customs[${ruleIndex}];
				const ${result} = ${context.async ? "await " : ""}${ruleVName}.schema.${fnName}.call(this, ${vName}, ${ruleVName}.schema, "${path}", parent, context);
				if (Array.isArray(${result})) {
					${result}.forEach(err => errors.push(Object.assign({ message: ${ruleVName}.messages[err.type], field }, err)));
				}
		`;
		}
		return "";
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
	 * Add a message
	 *
	 * @param {String} name
	 * @param {String} message
	 */
	addMessage(name, message) {
		this.messages[name] = message;
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

	/**
	 * Add a plugin
	 *
	 * @param {Function} fn
	 */
	plugin(fn) {
		if (typeof fn !== "function") throw new Error("Plugin fn type must be function");
		return fn(this);
	}

	/**
	 * Resolve the schema 'type' by:
	 * - parsing short hands into full type definitions
	 * - expanding arrays into 'multi' types with a rules property
	 * - objects which have a root $$type property into a schema which
	 *   explicitly has a 'type' property and a 'props' property.
	 *
	 * @param schema The schema to resolve the type of
	 */
	resolveType(schema) {
		if (typeof schema === "string") {
			schema = this.parseShortHand(schema);
		} else if (Array.isArray(schema)) {
			if (schema.length === 0)
				throw new Error("Invalid schema.");

			schema = {
				type: "multi",
				rules: schema
			};

			// Check 'optional' flag
			const isOptional = schema.rules
				.map(s => this.getRuleFromSchema(s))
				.every(rule => rule.schema.optional === true);
			if (isOptional)
				schema.optional = true;

			// Check 'nullable' flag
			const isNullable = schema.rules
				.map(s => this.getRuleFromSchema(s))
				.every(rule => rule.schema.nullable === true);
			if (isNullable)
				schema.nullable = true;
		}

		if (schema.$$type) {
			const type = schema.$$type;
			const otherShorthandProps = this.getRuleFromSchema(type).schema;
			delete schema.$$type;
			const props = Object.assign({}, schema);

			for (const key in schema) {  // clear object without changing reference
				delete schema[key];
			}

			deepExtend(schema, otherShorthandProps, { skipIfExist: true });
			schema.props = props;
		}

		return schema;
	}

	/**
	 * Normalize a schema, type or short hand definition by expanding it to a full form. The 'normalized'
	 * form is the equivalent schema with any short hands undone. This ensure that each rule; always includes
	 * a 'type' key, arrays always have an 'items' key, 'multi' always have a 'rules' key and objects always
	 * have their properties defined in a 'props' key
	 *
	 * @param {Object|String} value The value to normalize
	 * @returns {Object} The normalized form of the given rule or schema
	 */
	normalize(value) {
		let result = this.resolveType(value);
		if(this.aliases[result.type])
			result = deepExtend(result, this.normalize(this.aliases[result.type]), { skipIfExists: true});

		result = deepExtend(result, this.defaults[result.type], { skipIfExist: true });

		if(result.type === "multi") {
			result.rules = result.rules.map(r => this.normalize(r));
			result.optional = result.rules.every(r => r.optional === true);
			return result;
		}
		if(result.type === "array") {
			result.items = this.normalize(result.items);
			return result;
		}
		if(result.type === "object") {
			if(result.props) {
				Object.entries(result.props).forEach(([k,v]) => result.props[k] = this.normalize(v));
			}
		}
		if(typeof value === "object") {
			if(value.type) {
				const config = this.normalize(value.type);
				deepExtend(result, config, { skipIfExists: true });
			}
			else{
				Object.entries(value).forEach(([k,v]) => result[k] = this.normalize(v));
			}
		}

		return result;
	}
}

module.exports = Validator;
