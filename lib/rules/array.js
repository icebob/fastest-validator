"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages, customValidation }, path, context) {
	const src = [];

	src.push(`
		if (!Array.isArray(value)) {
			${this.makeError({ type: "array", actual: "value", messages })}
			return value;
		}

		var len = value.length;
	`);

	if (schema.empty === false) {
		src.push(`
			if (len === 0) {
				${this.makeError({ type: "arrayEmpty", actual: "value", messages })}
			}
		`);
	}

	if (schema.min != null) {
		src.push(`
			if (len < ${schema.min}) {
				${this.makeError({ type: "arrayMin", expected: schema.min, actual: "len", messages })}
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (len > ${schema.max}) {
				${this.makeError({ type: "arrayMax", expected: schema.max, actual: "len", messages })}
			}
		`);
	}

	if (schema.length != null) {
		src.push(`
			if (len !== ${schema.length}) {
				${this.makeError({ type: "arrayLength", expected: schema.length, actual: "len", messages })}
			}
		`);
	}

	if (schema.contains != null) {
		src.push(`
			if (value.indexOf(${JSON.stringify(schema.contains)}) === -1) {
				${this.makeError({ type: "arrayContains", expected: JSON.stringify(schema.contains), actual: "value", messages })}
			}
		`);
	}

	if (schema.unique === true) {
		src.push(`
			if(len > (new Set(value)).size) {
				${this.makeError({ type: "arrayUnique", expected: "Array.from(new Set(value.filter((item, index) => value.indexOf(item) !== index)))", actual: "value", messages })}
			}
		`);
	}

	if (schema.enum != null) {
		const enumStr = JSON.stringify(schema.enum);
		src.push(`
			for (var i = 0; i < value.length; i++) {
				if (${enumStr}.indexOf(value[i]) === -1) {
					${this.makeError({ type: "arrayEnum", expected: "\"" + schema.enum.join(", ") + "\"", actual: "value[i]", messages })}
				}
			}
		`);
	}

	if (schema.items != null) {

		src.push(`
			var arr = value;
			var parentField = field;
			for (var i = 0; i < arr.length; i++) {
		`);

		const rule = this.getRuleFromSchema(schema.items);
		src.push(this.compileRule(rule, context, path, "arr[i] = context.fn[%%INDEX%%](arr[i], (parentField ? parentField : \"\") + \"[\" + i + \"]\", parent, errors, context);", "arr[i]"));
		/*
		const res = rule.ruleFunction.call(this, rule, path, context);
		context.rules[context.index] = rule;
		if (res.source) {
			const fn = new Function("value", "field", "parent", "errors", "context", res.source);
			context.fn[context.index] = fn;
			src.push(`arr[i] = context.fn[${context.index}](arr[i], (parentField ? parentField : "") + "[" + i + "]", parent, errors, context);`);
		}
		context.index++;
		*/
		src.push(`
			}
		`);
	}

	src.push(`
		${customValidation("value")}
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
