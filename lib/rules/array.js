"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages, context) {
	const src = [];

	src.push(`
		if (!Array.isArray(value)) {
			${this.makeError({ type: "array", field: path, actual: "origValue", messages })}
		} else {
			const len = value.length;
	`);

	if (schema.empty === false) {
		src.push(`
			if (len === 0) {
				${this.makeError({ type: "arrayEmpty", field: path, actual: "origValue", messages })}
			}
		`);
	}

	if (schema.min != null) {
		src.push(`
			if (len < ${schema.min}) {
				${this.makeError({ type: "arrayMin", field: path, expected: schema.min, actual: "len", messages })}
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (len > ${schema.max}) {
				${this.makeError({ type: "arrayMax", field: path, expected: schema.max, actual: "len", messages })}
			}
		`);
	}

	if (schema.length != null) {
		src.push(`
			if (len !== ${schema.length}) {
				${this.makeError({ type: "arrayLength", field: path, expected: schema.length, actual: "len", messages })}
			}
		`);
	}

	if (schema.contains != null) {
		src.push(`
			if (value.indexOf(${JSON.stringify(schema.contains)}) === -1) {
				${this.makeError({ type: "arrayContains", field: path, expected: JSON.stringify(schema.contains), actual: "origValue", messages })}
			}
		`);
	}

	if (schema.enum != null) {
		const enumStr = JSON.stringify(schema.enum);
		src.push(`
			for (let i = 0; i < value.length; i++) {
				if (${enumStr}.indexOf(value[i]) === -1) {
					${this.makeError({ type: "arrayEnum", field: path, expected: "\"" + schema.enum.join(", ") + "\"", actual: "value[i]", messages })}
				}
			}
		`);
	}

	if (schema.items != null) {
		const rule = this.compileSchemaRule(schema.items);

		src.push(`
			const arr = value;
			const parentField = field;
			for (let i = 0; i < arr.length; i++) {
				let value = arr[i];
				let origValue = value;
				field = parentField + "[" + i + "]";
		`);

		const res = rule.ruleFunction.call(this, rule.schema, path, rule.messages, context);
		if (res.source)
			src.push(res.source);

		src.push(`
			}
			field = parentField;
		`);
	}

	src.push(`
		}
	`);

	return {
		source: src.join("\n")
	};
};
