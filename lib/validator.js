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

		const rules = flatten(schema.map(r => this._processRule(r, null, false)));
		return this._checkWrapper(rules, true);

	} else if (schema != null && typeof schema === "object") {
		const rules = flatten(Object.keys(schema).map(name => this._processRule(schema[name], name, false)));
		return this._checkWrapper(rules);

	}

	throw new Error("Invalid schema!");
};

/**
 * Process a rule item & return checker functions
 *
 * @param {Object} rule
 * @param {String} name
 * @param {Boolean} iterate
 */
Validator.prototype._processRule = function(rule, name, iterate) {
	const checks = [];

	if (Array.isArray(rule)) {
		// Compile the multiple schemas
		checks.push({
			fn: this.compile(rule),
			type: "_multi",
			name: name,
			schema: rule,
			iterate: iterate
		});

		return checks;
	}

	if (typeof rule === "string") {
		rule = {
			type: rule
		};
	}

	if (!this.rules[rule.type]) {
		throw new Error("Invalid '" + rule.type + "' type in validator schema!");
	}


	/**
	 * !IMPORTANT!: For the functioning of multiRule cases it is important that
	 * pushing of object and array special rules is done in directly after this
	 * simple rule. 
	 * If you which to push other checks, do it before the simple ones or after
	 * the array special case.
	 * See the comments in _checkWrapper for further explanation.
	 */
	checks.push({
		fn: this.rules[rule.type],
		type: rule.type,
		name: name,
		schema: rule,
		iterate: iterate
	});

	// Nested schema
	if (rule.type === "object" && rule.props) {
		// Compile the child schema
		checks.push({
			fn: this.compile(rule.props),
			type: rule.type,
			name: name,
			schema: rule,
			iterate: iterate,
			secondPart: true //first part is the "primitive" typeof check above
		});
	}

	// Array schema
	if (rule.type === "array" && rule.items) {
		// Compile the array schema
		checks.push({
			fn: this._checkWrapper(this._processRule(rule.items, null, false)),
			type: rule.type,
			name: name,
			schema: rule,
			iterate: true,
			secondPart: true //first part is the "primitive" typeof check above
		});
	}

	return checks;
};

/**
 * Create a wrapper function for compiled schema.
 *
 * @param {Array} rules
 * @param {Boolean} isMultipleRules
 */
Validator.prototype._checkWrapper = function(rules, isMultipleRules) {
	const self = this;

	// Compiled validator function
	return function(obj, _schema, pathStack) {
		let errors = [];
		const count = rules.length;
		for (let i = 0; i < count; i++) {
			const check = rules[i];
			const schema = check.schema;

			let value;
			let stack;
			if (check.name) {
				value = obj[check.name];
				stack = (pathStack ? pathStack + "." : "") + check.name;
			} else {
				value = obj;
				stack = pathStack ? pathStack : "";
			}

			// Check required fields
			if ((value === undefined || value === null)) {
				if (check.type === "forbidden")
					continue;

				if (schema.optional === true)
					continue;

				if (!Array.isArray(schema)) {
					self.handleResult(errors, stack, self.makeError("required"));
					continue;
				}

			} // else {
			// Call the checker function
			if (check.iterate) {
				let errorInCurrentArray = false;
				const l = value.length;
				for (let i = 0; i < l; i++) {
					let _stack = stack + "[" + i + "]";
					let res = check.fn.call(self, value[i], schema, _stack, obj);
					if (res !== true) {
						errorInCurrentArray = true;
						self.handleResult(errors, _stack, res);
					}
				}
				/**
					 * If this is second part of a multiRule array check and the array
					 * is valid, then the rule is valid.
					 */
				if (!errorInCurrentArray && isMultipleRules && check.secondPart) {
					return true;
				}
			} else {
				let res = check.fn.call(self, value, schema, stack, obj);

				if (isMultipleRules) {
					if (res === true) {
						/**
							 * Object and array checks are divided into two internal checks. In case of a multiRule
							 * we have to make sure to check both parts. Thus we we continue to also do the second
							 * check if their is one.
							 */
						const nextRule = rules[i + 1];
						if (nextRule && nextRule.secondPart){
							continue;
						}
						// Jump out after first success and clear previous errors
						return true;
					}
				}

				if (res !== true)
					self.handleResult(errors, stack, res);
			}
			//}
		}

		return errors.length === 0 ? true : errors;
	};
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
