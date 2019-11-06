"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function checkForbidden({ schema, messages }, path) {
	return {
		source: `
			if (value !== null && value !== undefined)
				${this.makeError({ type: "forbidden",  actual: "value", messages })}

			return value;
		`
	};
};
