"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const src = [];
	let sanitized = false;

	src.push(`
		var origValue = value;
	`);

	if (schema.convert === true) {
		sanitized = true;
		src.push(`
			if (typeof value !== "boolean") {
				if (
				value === 1
				|| value === "true"
				|| value === "1"
				|| value === "on"
				) {
					value = true;
				} else if (
				value === 0
				|| value === "false"
				|| value === "0"
				|| value === "off"
				) {
					value = false;
				}
			}
		`);
	}

	src.push(`
		if (typeof value !== "boolean") {
			${this.makeError({ type: "boolean",  actual: "origValue", messages })}
		}
		
		return value;
	`);

	return {
		sanitized,
		source: src.join("\n")
	};
};
