"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema) {
	return `
		if (${JSON.stringify(schema.values || [])}.indexOf(value) === -1) {
			errors.push({ type: "enumValue", field, schema.values, value);
		}
	`;
};
