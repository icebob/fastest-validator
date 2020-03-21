"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages, customValidation }, path) {
	const enumStr = JSON.stringify(schema.values || []);
	return {
		source: `
			if (${enumStr}.indexOf(value) === -1)
				${this.makeError({ type: "enumValue", expected: "\"" + schema.values.join(", ") + "\"", actual: "value", messages })}
			
			${customValidation("value")}

			return value;
		`
	};
};
