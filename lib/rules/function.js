"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	return `
		if (typeof value !== "function") {
			${this.makeError({ type: "function", field: path, actual: "value", messages })}
		}
	`;
};
