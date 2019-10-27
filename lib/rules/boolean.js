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
			if (typeof value !== "boolean") {
				if (
				value === 1
				|| value === "true"
				|| value === "1"
				|| value === "on"
				) {
					value = true;
				} else if (
				value === 0
				|| value === "false"
				|| value === "0"
				|| value === "off"
				) {
					value = false;
				}
			}
		`);
	}

	src.push(`
		if (typeof value !== "boolean") {
			${this.makeError({ type: "boolean", field: path, actual: "value", messages })}
		}
	`);

	return src.join("\n");
};
