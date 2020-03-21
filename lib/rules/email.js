"use strict";

const PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const BASIC_PATTERN = /^\S+@\S+\.\S+$/;

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages, customValidation }, path) {
	const src = [];

	const pattern = schema.mode == "precise" ? PRECISE_PATTERN : BASIC_PATTERN;
	let sanitized = false;

	src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string",  actual: "value", messages })}
			return value;
		}
	`);

	if (schema.normalize) {
		sanitized = true;
		src.push(`
			value = value.trim().toLowerCase();
		`);
	}

	src.push(`
		if (!${pattern.toString()}.test(value))
			${this.makeError({ type: "email",  actual: "value", messages })}

		${customValidation("value")}

		return value;
	`);

	return {
		sanitized,
		source: src.join("\n")
	};
};
