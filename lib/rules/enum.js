"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	const enumStr = JSON.stringify(schema.values || []);
	return {
		source: `
			if (${enumStr}.indexOf(value) === -1) {
				${this.makeError({ type: "enumValue", expected: "\"" + schema.values.join(", ") + "\"", actual: "origValue", messages })}
			}
		`
	};
};
