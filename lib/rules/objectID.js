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

		${schema.convert ? "return new ObjectID(value)" : "return value;" } ;
	`);

	return {
		source: src.join("\n")
	};
};
