"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function checkForbidden(schema, path, messages) {
	return {
		source: `
			if (value !== null && value !== undefined) {
				${this.makeError({ type: "forbidden", field: path, actual: "origValue", messages })}
			}
		`
	};
};
