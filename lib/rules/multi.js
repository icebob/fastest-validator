"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages, context) {
	const src = [];

	src.push(`
		var prevErrLen = errors.length;
		var errBefore;
		var hasValid = false;
		var newVal = value;
	`);

	for (let i = 0; i < schema.rules.length; i++) {
		src.push(`
			if (!hasValid) {
				errBefore = errors.length;
		`);

		const rule = this.compileSchemaRule(schema.rules[i]);
		const res = rule.ruleFunction.call(this, rule.schema, path, rule.messages, context);
		if (res.source) {
			const fn = new Function("value", "field", "parent", "errors", "context", res.source);
			context.fn[context.index] = fn;
			src.push(`
					var tmpVal = context.fn[${context.index}](value, field, parent, errors, context);
				`);
			context.index++;
		}

		src.push(`
				if (errors.length == errBefore) {
					hasValid = true;
					newVal = tmpVal;
				}
			}
		`);
	}

	src.push(`
		if (hasValid) {
			errors.length = prevErrLen;
		}

		return newVal;
	`);

	return {
		source: src.join("\n")
	};
};
