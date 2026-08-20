"use strict";

const { assertArray } = require("../helpers/schema-options");

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema }, path, context) {
	const rules = schema.rules != null ? assertArray("multi", "rules", schema.rules) : [];
	const src = [];

	src.push(`
		var hasValid = false;
		var newVal = value;
		var checkErrors = [];
		var errorsSize = errors.length;
	`);

	for (let i = 0; i < rules.length; i++) {
		src.push(`
			if (!hasValid) {
				var _errors = [];
		`);

		const rule = this.getRuleFromSchema(rules[i]);
		src.push(this.compileRule(rule, context, path, `var tmpVal = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, parent, _errors, context);`, "tmpVal"));
		src.push(`
				if (errors.length == errorsSize && _errors.length == 0) {
					hasValid = true;
					newVal = tmpVal;
				} else {
					Array.prototype.push.apply(checkErrors, [].concat(_errors, errors.splice(errorsSize)));
				}
			}
		`);
	}

	src.push(`
		if (!hasValid) {
			Array.prototype.push.apply(errors, checkErrors);
		}

		return newVal;
	`);

	return {
		source: src.join("\n")
	};
};
