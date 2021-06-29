"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const enumStr = JSON.stringify(schema.values || []);
	return {
		source: `
			if (${enumStr}.indexOf(value) === -1) {
				if(!schema.values) { throw 'Please provide "values" field to schema object in order to use it with "enum" validator like that: { type: "enum", values: ["foo", "bar"] }'; }
				${this.makeError({ type: "enumValue", expected: "\"" + schema.values.join(", ") + "\"", actual: "value", messages })}
			}
			return value;
		`
	};
};
