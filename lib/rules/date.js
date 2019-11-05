"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	const src = [];
	let sanitized = false;

	src.push(`
		var origValue = value;
	`);

	if (schema.convert === true) {
		sanitized = true;
		src.push(`
			if (!(value instanceof Date)) {
				value = new Date(value);
			}
		`);
	}

	src.push(`
		if (!(value instanceof Date) || isNaN(value.getTime()))
			${this.makeError({ type: "date",  actual: "origValue", messages })}

		return value;
	`);

	return {
		sanitized,
		source: src.join("\n")
	};
};
