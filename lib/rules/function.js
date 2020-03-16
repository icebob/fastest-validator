"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages, customValidation }, path) {
	return {
		source: `
			if (typeof value !== "function")
				${this.makeError({ type: "function",  actual: "value", messages })}

			${customValidation("value")}

			return value;
		`
	};
};
