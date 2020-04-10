"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages, customValidation }, path, context) {
	const src = [];

	if (context.customs[path]) {
		context.customs[path].instanceOf = schema.instanceOf;
	} else {
		context.customs[path] = { instanceOf: schema.instanceOf };
	}

	const className = schema.instanceOf.name ? schema.instanceOf.name : "<UnknowClass>";

	src.push(`
		if (!(value instanceof context.customs["${path}"].instanceOf))
			${this.makeError({ type: "classInstanceOf",  actual: "value", expected: "'" + className + "'", messages })}
	`);

	src.push(`
		${customValidation("value")}
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
