"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const src = [];

	const className = schema.instanceOf.name ? schema.instanceOf.name : "<UnknowClass>";

	src.push(`
		if (!(value instanceof context.customs["${path}"].schema.instanceOf))
			${this.makeError({ type: "classInstanceOf",  actual: "value", expected: "'" + className + "'", messages })}
	`);

	src.push(`
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
