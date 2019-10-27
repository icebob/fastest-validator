"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
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
			${this.makeError({ type: "date", field: path, actual: "value", messages })}
		}
	`);

	return src.join("\n");
};
