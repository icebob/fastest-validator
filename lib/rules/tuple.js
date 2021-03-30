"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	const src = [];

	if (schema.items != null) {
		if (!Array.isArray(schema.items)) {
			throw new Error(`Invalid '${schema.type}' schema. The 'items' field must be an array.`);
		}

		if (schema.items.length === 0) {
			throw new Error(`Invalid '${schema.type}' schema. The 'items' field must not be an empty array.`);
		}
	}

	src.push(`
		if (!Array.isArray(value)) {
			${this.makeError({ type: "tuple", actual: "value", messages })}
			return value;
		}

		var len = value.length;
	`);


	if (schema.empty === false) {
		src.push(`
			if (len === 0) {
				${this.makeError({ type: "tupleEmpty", actual: "value", messages })}
				return value;
			}
		`);
	}

	if (schema.items != null) {
		src.push(`
			if (${schema.empty} !== false && len === 0) {
				return value;
			}

			if (len !== ${schema.items.length}) {
				${this.makeError({type: "tupleLength", expected: schema.items.length, actual: "len", messages})}
				return value;
			}
		`);

		src.push(`
			var arr = value;
			var parentField = field;
		`);

		for (let i = 0; i < schema.items.length; i++) {
			src.push(`
			value = arr[${i}];
		`);

			const itemPath = `${path}[${i}]`;
			const rule = this.getRuleFromSchema(schema.items[i]);
			const innerSource = `
			arr[${i}] = ${context.async ? "await " : ""}context.fn[%%INDEX%%](arr[${i}], (parentField ? parentField : "") + "[" + ${i} + "]", parent, errors, context);
		`;
			src.push(this.compileRule(rule, context, itemPath, innerSource, `arr[${i}]`));
		}
		src.push(`
		return arr;
	`);
	} else {
		src.push(`
		return value;
	`);
	}

	return {
		source: src.join("\n")
	};
};
