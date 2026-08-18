"use strict";

const {
	assertNumber,
	assertNonNegativeInteger,
	assertBoolean,
	safeStringLiteral
} = require("../helpers/schema-options");

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	// Compile-time validation of schema options
	const convert = schema.convert != null ? assertBoolean("array", "convert", schema.convert) : undefined;
	const empty = schema.empty != null ? assertBoolean("array", "empty", schema.empty) : undefined;
	const min = schema.min != null ? assertNumber("array", "min", schema.min) : undefined;
	const max = schema.max != null ? assertNumber("array", "max", schema.max) : undefined;
	const length = schema.length != null ? assertNonNegativeInteger("array", "length", schema.length) : undefined;
	const unique = schema.unique != null ? assertBoolean("array", "unique", schema.unique) : undefined;

	const src = [];

	let sanitized = false;
	if (convert === true) {
		sanitized = true;
		// Convert to array if not and the value is not null or undefined
		src.push(`
			if (!Array.isArray(value) && value != null) {
				value = [value];
			}
		`);
	}

	src.push(`
		if (!Array.isArray(value)) {
			${this.makeError({ type: "array", actual: "value", messages })}
			return value;
		}

		var len = value.length;
	`);

	if (empty === false) {
		src.push(`
			if (len === 0) {
				${this.makeError({ type: "arrayEmpty", actual: "value", messages })}
			}
		`);
	}

	if (min != null) {
		src.push(`
			if (len < ${min}) {
				${this.makeError({ type: "arrayMin", expected: min, actual: "len", messages })}
			}
		`);
	}

	if (max != null) {
		src.push(`
			if (len > ${max}) {
				${this.makeError({ type: "arrayMax", expected: max, actual: "len", messages })}
			}
		`);
	}

	if (length != null) {
		src.push(`
			if (len !== ${length}) {
				${this.makeError({ type: "arrayLength", expected: length, actual: "len", messages })}
			}
		`);
	}

	if (schema.contains != null) {
		src.push(`
			if (value.indexOf(${safeStringLiteral(schema.contains)}) === -1) {
				${this.makeError({ type: "arrayContains", expected: safeStringLiteral(schema.contains), actual: "value", messages })}
			}
		`);
	}

	if (unique === true) {
		src.push(`
			if(len > (new Set(value)).size) {
				${this.makeError({ type: "arrayUnique", expected: "Array.from(new Set(value.filter((item, index) => value.indexOf(item) !== index)))", actual: "value", messages })}
			}
		`);
	}

	if (schema.enum != null) {
		const enumStr = safeStringLiteral(schema.enum);
		src.push(`
			for (var i = 0; i < value.length; i++) {
				if (${enumStr}.indexOf(value[i]) === -1) {
					${this.makeError({ type: "arrayEnum", expected: safeStringLiteral(schema.enum.join(", ")), actual: "value[i]", messages })}
				}
			}
		`);
	}

	if (schema.items != null) {
		src.push(`
			var arr = value;
			var parentField = field;
			for (var i = 0; i < arr.length; i++) {
				value = arr[i];
		`);

		const itemPath = path + "[]";
		const rule = this.getRuleFromSchema(schema.items);
		const innerSource = `arr[i] = ${context.async ? "await " : ""}context.fn[%%INDEX%%](arr[i], (parentField ? parentField : "") + "[" + i + "]", parent, errors, context)`;
		src.push(this.compileRule(rule, context, itemPath, innerSource, "arr[i]"));
		src.push(`
			}
		`);
		src.push(`
		return arr;
	`);
	} else {
		src.push(`
		return value;
	`);
	}

	return {
		sanitized,
		source: src.join("\n")
	};
};
