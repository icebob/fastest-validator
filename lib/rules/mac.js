"use strict";

const PATTERN = /^((([a-f0-9][a-f0-9]+[-]){5}|([a-f0-9][a-f0-9]+[:]){5})([a-f0-9][a-f0-9])$)|(^([a-f0-9][a-f0-9][a-f0-9][a-f0-9]+[.]){2}([a-f0-9][a-f0-9][a-f0-9][a-f0-9]))$/i;

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	return {
		source: `
			if (typeof value !== "string") {
				${this.makeError({ type: "string", field: path, actual: "origValue", messages })}
			} else {

				const v = value.toLowerCase();
				if (!${PATTERN.toString()}.test(v)) {
					${this.makeError({ type: "mac", field: path, actual: "origValue", messages })}
				}
			}
		`
	};
};
