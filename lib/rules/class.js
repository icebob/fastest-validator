"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages, index }, path, context) {
	const src = [];

	const className = schema.instanceOf.name ? schema.instanceOf.name : "<UnknowClass>";
	if (!context.customs[index]) context.customs[index] = { schema };
	else context.customs[index].schema = schema;

	src.push(`
		if (!(value instanceof context.customs[${index}].schema.instanceOf))
			${this.makeError({ type: "classInstanceOf",  actual: "value", expected: "'" + className + "'", messages })}
	`);

	src.push(`
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
