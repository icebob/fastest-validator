"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const src = [];

	src.push(`
		var hasValid = false;
		var newVal = value;
		var checkErrors = [];
	`);

	for (let i = 0; i < schema.rules.length; i++) {
		src.push(`
			if (!hasValid) {
				var _errors = [];
		`);

		const rule = this.getRuleFromSchema(schema.rules[i]);
		src.push(this.compileRule(rule, context, path, `var tmpVal = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, parent, _errors, context);`, "tmpVal"));
		src.push(`
				if (_errors.length == 0) {
					hasValid = true;
					newVal = tmpVal;
				} else {
					Array.prototype.push.apply(checkErrors, _errors);
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
