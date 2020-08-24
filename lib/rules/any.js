"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function(/*{ schema, messages }, path, context*/) {
	const src = [];
	src.push(`
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
