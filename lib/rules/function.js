"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	return {
		source: `
			if (typeof value !== "function")
				${this.makeError({ type: "function",  actual: "value", messages })}

			return value;
		`
	};
};
