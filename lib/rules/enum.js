"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const values = schema.values || [];
	const enumStr = JSON.stringify(values);
	return {
		source: `
			if (${enumStr}.indexOf(value) === -1)
				${this.makeError({ type: "enumValue", expected: JSON.stringify(values.join(", ")), actual: "value", messages })}
			
			return value;
		`
	};
};
