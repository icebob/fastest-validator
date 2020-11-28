"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	const src = [];

	src.push(`
		var prevErrLen = errors.length;
		var ifValid = false;
		var newVal = value;
	`);

	const ifRule = this.getRuleFromSchema(schema.if);
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
        ifValid = true;
      }
      errors.length = prevErrLen;
  `);

	src.push(`
    if (ifValid) {
  `);
	const thenRule = this.getRuleFromSchema(schema.then);
	src.push(
		this.compileRule(
			thenRule,
			context,
			path,
			"newVal = context.fn[%%INDEX%%](value, field, parent, errors, context);",
			"newVal"
		)
	);

	if (schema.else) {
		src.push(`
    } else {
  `);

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
    }
  `);

	src.push(`
		return newVal;
	`);

	return {
		source: src.join("\n"),
	};
};
