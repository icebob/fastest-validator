"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function checkForbidden(schema, path) {
	return `
		if (value !== null && value !== undefined) {
			errors.push({ type: "forbidden", field: "${path}" });
		}
	`;
};
