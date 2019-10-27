"use strict";

const PATTERN = /^((([a-f0-9][a-f0-9]+[-]){5}|([a-f0-9][a-f0-9]+[:]){5})([a-f0-9][a-f0-9])$)|(^([a-f0-9][a-f0-9][a-f0-9][a-f0-9]+[.]){2}([a-f0-9][a-f0-9][a-f0-9][a-f0-9]))$/i;

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path) {
	return `
		if (typeof value !== "string") {
			errors.push({ type: "string", field: "${path}" });
		} else {

			value = value.toLowerCase();
			if (!${PATTERN.toString()}.test(value)) {
				errors.push({ type: "mac", field: "${path}", actual: value });
			}
		}
	`;
};
