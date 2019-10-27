"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages, context) {
	const src = [];

	src.push(`
		const prevErrLen = errors.length;
		let errBefore;
		let hasValid = false;
	`);

	for (let i = 0; i < schema.rules.length; i++) {
		src.push(`
			if (!hasValid) {
				errBefore = errors.length;
		`);

		const rule = this.compileSchemaRule(schema.rules[i]);
		src.push(rule.ruleFunction.call(this, rule.schema, path, rule.messages, context));

		src.push(`
				if (errors.length == errBefore) {
					hasValid = true;
				}
			}
		`);
	}

	src.push(`
		if (hasValid) {
			errors.length = prevErrLen;
		}
	`);

	return src.join("\n");
};
