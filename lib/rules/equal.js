"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const src = [];

	if (schema.field) {
		if (schema.strict) {
			src.push(`
				if (value !== parent["${schema.field}"])
			`);
		} else {
			src.push(`
				if (value != parent["${schema.field}"])
			`);
		}
		src.push(`
				${this.makeError({ type: "equalField",  actual: "value", expected: JSON.stringify(schema.field), messages })}
		`);
	} else {
		if (schema.strict) {
			src.push(`
				if (value !== ${JSON.stringify(schema.value)})
			`);
		} else {
			src.push(`
				if (value != ${JSON.stringify(schema.value)})
			`);
		}
		src.push(`
				${this.makeError({ type: "equalValue",  actual: "value", expected: JSON.stringify(schema.value), messages })}
		`);
	}

	src.push(`
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
