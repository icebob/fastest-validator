"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function checkForbidden(schema) {
	return `
		if (value !== null && value !== undefined) {
			errors.push({ type: "forbidden", field });
		}
	`;
};
