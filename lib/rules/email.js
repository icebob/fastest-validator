"use strict";

const PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const BASIC_PATTERN = /^\S+@\S+\.\S+$/;

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path) {
	const pattern = schema.mode == "precise" ? PRECISE_PATTERN : BASIC_PATTERN;

	return `
		if (typeof value !== "string") {
			errors.push({ type: "string", field: "${path}" });
		} else {
			if (!${pattern.toString()}.test(value)) {
				errors.push({ type: "email", field: "${path}", actual: value });
			}
		}
	`;
};
