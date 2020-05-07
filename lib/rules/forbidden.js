"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function checkForbidden({ schema, messages }, path, context) {
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

		return value;
	`);

	return {
		source: src.join("\n")
	};
};
