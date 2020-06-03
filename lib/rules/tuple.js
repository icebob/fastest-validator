"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	const src = [];

	if (schema.items === null) {
		throw new Error(`Invalid '${schema.type}' schema. The 'items' field is missing.`);
	}

	if (!Array.isArray(schema.items)) {
		throw new Error(`Invalid '${schema.type}' schema. The 'items' field must be an array.`);
	}

	if (schema.items.length !== 2) {
		throw new Error(`Invalid '${schema.type}' schema. The 'items' field must contain 2 elements.`);
	}

	src.push(`
		if (!Array.isArray(value)) {
			${this.makeError({ type: "tuple", actual: "value", messages })}
			return value;
		}

		var len = value.length;
	`);


	src.push(`
		if (len === 0) {
			${this.makeError({ type: "tupleEmpty", actual: "value", messages })}
			return value;
		}
	`);


	src.push(`
		if (len !== 2) {
			${this.makeError({ type: "tupleLength", expected: 2, actual: "len", messages })}
			return value;
		}
	`);

	src.push(`
		var arr = value;
		var parentField = field;
	`);

	for (let i = 0; i < schema.items.length; i++) {
		const itemPath = path + "[]";
		const rule = this.getRuleFromSchema(schema.items[i]);
		const innerSource = `
			arr[${i}] = context.fn[%%INDEX%%](arr[${i}], (parentField ? parentField : "") + "[" + ${i} + "]", parent, errors, context);
			${this.makeCustomValidator({ vName: `arr[${i}]`, path: itemPath, schema: rule.schema, context, messages })}
		`;
		src.push(this.compileRule(rule, context, itemPath, innerSource, `arr[${i}]`));
	}

	src.push(`
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
