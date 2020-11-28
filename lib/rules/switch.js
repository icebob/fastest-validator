"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	const src = [];

	src.push(`
		var prevErrLen = errors.length;
		var isValid = false;
		var newVal = value;
	`);

	for (let i = 0; i < schema.cases.length; i++) {
		const ifRule = this.getRuleFromSchema(schema.cases[i].if);
		src.push(
			this.compileRule(
				ifRule,
				context,
				path,
				"context.fn[%%INDEX%%](value, field, parent, errors, context);"
			)
		);
		src.push(`
      if (errors.length == prevErrLen) {
        isValid = true;
      }
      errors.length = prevErrLen

      if(isValid) {
		`);

		const thenRule = this.getRuleFromSchema(schema.cases[i].then);
		src.push(
			this.compileRule(
				thenRule,
				context,
				path,
				"newVal = context.fn[%%INDEX%%](value, field, parent, errors, context);",
				"newVal"
			)
		);

		src.push(`
        return newVal;
      }
		`);
	}

	if (schema.else) {
		const elseRule = this.getRuleFromSchema(schema.else);
		src.push(
			this.compileRule(
				elseRule,
				context,
				path,
				"newVal = context.fn[%%INDEX%%](value, field, parent, errors, context);",
				"newVal"
			)
		);
	}

	src.push(`
		return newVal;
	`);

	return {
		source: src.join("\n"),
	};
};
