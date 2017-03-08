"use strict";

let defaultsDeep = require("lodash/defaultsDeep");
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

	let checks = [];

	// Process a rule definition
	const processRule = function processRule(rule, name, iterate = false) {
		if (typeof rule === "string") {
			rule = {
				type: rule
			};
		}

		if (self.rules[rule.type]) {
			checks.push({
				fn: self.rules[rule.type],
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
				fn: self.compile(rule.props),
				type: rule.type,
				name: name,
				schema: rule,
				iterate: iterate
			});
		}

		// Array schema
		if (rule.type === "array" && rule.items) {
			// Compile the child schema
			processRule(rule.items, name, true);
		}		
	};

	// Process the whole schema
	Object.keys(schema).forEach(name => processRule(schema[name], name, false));

	// Compiled validator function
	return function(obj, _schema, pathStack = "") {
		let errors = [];
		const count = checks.length;
		for (let i = 0; i < count; i++) {
			const check = checks[i];
			const schema = check.schema;
			const value = obj[check.name];
			let stack = (pathStack ? pathStack + "." : "") + check.name;

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