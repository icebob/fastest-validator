"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path) {
	const src = [];

	if (schema.convert === true) {
		src.push(`
			if (!(value instanceof Date)) {
				value = new Date(value);
			}
		`);
	}

	src.push(`
		if (!(value instanceof Date) || isNaN(value.getTime())) {
			errors.push({ type: "date", field: "${path}" });
		}
	`);

	return src.join("\n");
};
