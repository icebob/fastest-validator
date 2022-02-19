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
			if (!(value instanceof Date)) {
				value = new Date(value.length && !isNaN(+value) ? +value : value);
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
