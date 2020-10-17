"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages, index }, path, context) {
	const src = [];

	if (!context.customs[index]) context.customs[index] = { schema };
	else context.customs[index].schema = schema;

	src.push(`
		const ObjectID = context.customs[${index}].schema.ObjectID;
		if (!ObjectID.isValid(value)) {
			${this.makeError({ type: "objectID", actual: "value", messages })}
			return;
		}
	`);

	if (schema.convert === true) src.push("return new ObjectID(value)");
	else if (schema.convert === "hexString") src.push("return value.toString()");
	else src.push("return value");

	return {
		source: src.join("\n")
	};
};
