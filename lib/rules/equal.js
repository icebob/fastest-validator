"use strict";

const { assertString, safeStringLiteral } = require("../helpers/schema-options");

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }) {
	const field = schema.field != null ? assertString("equal", "field", schema.field) : undefined;
	const src = [];

	if (field) {
		if (schema.strict) {
			src.push(`
				if (value !== parent[${safeStringLiteral(field)}])
			`);
		} else {
			src.push(`
				if (value != parent[${safeStringLiteral(field)}])
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
