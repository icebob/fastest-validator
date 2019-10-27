"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema) {
	return `
		if (typeof value !== "function") {
			errors.push({ type: "function", field });
		}
	`;
};
