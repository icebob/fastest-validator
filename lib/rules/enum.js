"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path) {
	return `
		if (${JSON.stringify(schema.values || [])}.indexOf(value) === -1) {
			errors.push({ type: "enumValue", field: "${path}", expected: ${schema.values}, actual: value });
		}
	`;
};
