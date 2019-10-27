"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	const enumStr = JSON.stringify(schema.values || []);
	return `
		if (${enumStr}.indexOf(value) === -1) {
			${this.makeError({ type: "enumValue", field: path, expected: "\"" + enumStr + "\"", actual: "value", messages })}
		}
	`;
};
