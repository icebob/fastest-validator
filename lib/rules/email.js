"use strict";

const PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const BASIC_PATTERN = /^\S+@\S+\.\S+$/;

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	const pattern = schema.mode == "precise" ? PRECISE_PATTERN : BASIC_PATTERN;

	return {
		source: `
			if (typeof value !== "string") {
				${this.makeError({ type: "string", field: path, actual: "value", messages })}
			} else {
				if (!${pattern.toString()}.test(value)) {
					${this.makeError({ type: "email", field: path, actual: "value", messages })}
				}
			}
		`
	};
};
