"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function checkForbidden({ schema, messages, customValidation }, path) {
	const src = [];

	src.push(`
		if (value !== null && value !== undefined) {
	`);

	if (schema.remove) {
		src.push(`
			return undefined;
		`);

	} else {
		src.push(`
			${this.makeError({ type: "forbidden",  actual: "value", messages })}
		`);
	}

	src.push(`
		}

		${customValidation("value")}

		return value;
	`);

	return {
		source: src.join("\n")
	};
};
