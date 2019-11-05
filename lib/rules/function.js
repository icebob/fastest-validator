"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	return {
		source: `
			if (typeof value !== "function")
				${this.makeError({ type: "function",  actual: "value", messages })}

			return value;
		`
	};
};
