"use strict";

let defaultsDeep = require("lodash/defaultsDeep");
let flatten = require("lodash/flatten");
let defaultMessages = require("./messages");
let glob = require("glob");
let path = require("path");

/**
 * Validator class constructor
 * 
 * @param {Object} opts 
 */
function Validator(opts) {
	this.opts = defaultsDeep(opts, {
		messages: defaultMessages
	});

	this.messages = this.opts.messages;

	// Load rules
	this.rules = {};

	let files = glob.sync(path.join(__dirname, "rules", "*.js"));
	files.forEach(file => {
		const name = path.parse(file).name;
		this.rules[name] = require(file);
	});
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
 */
Validator.prototype.compile = function(schema) {
	const self = this;
	let rules;
	// Process the whole schema
	if (Array.isArray(schema)) {
		if (schema.length !== 1) 
			throw new Error("If the schema is an Array, must be only one element!");

		rules = self._processRule(schema[0], null, false);
	} else {
		rules = flatten(Object.keys(schema).map(name => self._processRule(schema[name], name, false)));
	}

	return this._checkWrapper(rules);
};

/**
 * Process a rule item & return checker functions
 * 
 * @param {Object} rule
 * @param {String} name
 * @param {Boolean} iterate
 */
Validator.prototype._processRule = function(rule, name, iterate) {
	let checks = [];

	if (typeof rule === "string") {
		rule = {
			type: rule
		};
	}

	if (this.rules[rule.type]) {
		checks.push({
			fn: this.rules[rule.type],
			type: rule.type,
			name: name,
			schema: rule,
			iterate: iterate
		});
	} else 
		throw new Error("Invalid '" + rule.type + "' type in validator schema!");

	// Nested schema
	if (rule.type === "object" && rule.props) {
		// Compile the child schema
		checks.push({
			fn: this.compile(rule.props),
			type: rule.type,
			name: name,
			schema: rule,
			iterate: iterate
		});
	}

	// Array schema
	if (rule.type === "array" && rule.items) {
		// Compile the array items
		checks.push({
			fn: this._checkWrapper(this._processRule(rule.items, null, false)),
			type: rule.type,
			name: name,
			schema: rule,
			iterate: true
		});			
	}

	return checks;		
};

/**
 * Create a wrapper function for compiled schema.
 * 
 * @param {Array} rules
 */
Validator.prototype._checkWrapper = function(rules) {
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
			if ((value === undefined || value === null) && check.type !== "forbidden") {
				if (schema.optional !== true) {
					self.handleResult(errors, stack, self.makeError("required"));
				} else 
					continue;

			} else {
				// Call the checker function
				if (check.iterate) {
					const l = value.length;
					for (let i = 0; i < l; i++) {
						let _stack = stack + "[" + i + "]";
						let res = check.fn.call(self, value[i], schema, _stack);
						if (res !== true)
							self.handleResult(errors, _stack, res);
					}
				} else {
					let res = check.fn.call(self, value, schema, stack);
					if (res !== true)
						self.handleResult(errors, stack, res);
				}
			}
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
			err.message = this.resolveMessage(err.type, err.field, err.args);

		errors.push(err);
	});
};

/**
 * Create a validation error object
 * 
 * @param {String} type 
 * @param {Array} args 
 */
Validator.prototype.makeError = function(type, args) {
	return {
		type: type,
		args: args || []
	};
};

/**
 * Resolve message string from a validation error object
 * 
 * @param {String} type 
 * @param {String} field 
 * @param {Array} args 
 */
Validator.prototype.resolveMessage = function(type, field, args) {
	let msg = this.messages[type];
	if (msg != null) {
		msg = msg.replace(/\{name\}/g, field);

		return msg.replace(/{(\d+)}/g, function(match, i) { 
			return typeof args[i] !== "undefined" ? args[i] : match;
		});		
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