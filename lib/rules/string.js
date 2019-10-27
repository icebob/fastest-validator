"use strict";

const NUMERIC_PATTERN = /^-?[0-9]\d*(\.\d+)?$/;
const ALPHA_PATTERN = /^[a-zA-Z]+$/;
const ALPHANUM_PATTERN = /^[a-zA-Z0-9]+$/;
const ALPHADASH_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function checkString(schema, path) {
	const src = [];
	src.push(`
		if (typeof value !== "string") {
			errors.push({ type: "string", field: "${path}" });
		} else {
			const len = value.length;
	`);

	if (schema.empty === false) {
		src.push(`
			if (len === 0) {
				errors.push({ type: "stringEmpty", field: "${path}" });
			}
		`);
	}

	if (schema.min != null) {
		src.push(`
			if (len < ${schema.min}) {
				errors.push({ type: "stringMin", field: "${path}", expected: ${schema.min}, actual: len });
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (len > ${schema.max}) {
				errors.push({ type: "stringMax", field: "${path}", expected: ${schema.max}, actual: len });
			}
		`);
	}

	if (schema.length != null) {
		src.push(`
			if (len !== ${schema.length}) {
				errors.push({ type: "stringLength", field: "${path}", expected: ${schema.length}, actual: len });
			}
		`);
	}

	if (schema.pattern != null) {
		src.push(`
			if (!${schema.pattern}.test(value))
				errors.push({ type: "stringPattern", field: "${path}", expected: "${schema.pattern}", actual: value });
		`);
	}

	if (schema.contains != null) {
		src.push(`
			if (value.indexOf("${schema.contains}") === -1) {
				errors.push({ type: "stringContains", field: "${path}", expected: "${schema.contains}", actual: value });
			}
		`);
	}

	if (schema.enum != null) {
		const enumStr = JSON.stringify(schema.enum);
		src.push(`
			if (${enumStr}.indexOf(value) === -1) {
				errors.push({ type: "stringEnum", field: "${path}", expected: ${enumStr}, actual: value });
			}
		`);
	}

	if (schema.numeric === true) {
		src.push(`
			if (!${NUMERIC_PATTERN.toString()}.test(value) ) {
				errors.push({ type: "stringNumeric", field: "${path}", expected: "A numeric string", actual: value });
			}
		`);
	}

	if(schema.alpha === true) {
		src.push(`
			if(!${ALPHA_PATTERN.toString()}.test(value)) {
				errors.push({ type: "stringAlpha", field: "${path}", expected: "An alphabetic string", actual: value });
			}
		`);
	}

	if(schema.alphanum === true) {
		src.push(`
			if(!${ALPHANUM_PATTERN.toString()}.test(value)) {
				errors.push({ type: "stringAlphanum", field: "${path}", expected: "An alphanumeric string", actual: value });
			}
		`);
	}

	if(schema.alphadash === true) {
		src.push(`
			if(!${ALPHADASH_PATTERN.toString()}.test(value)) {
				errors.push({ type: "stringAlphadash", field: "${path}", expected: "An alphadash string", actual: value });
			}
		`);
	}

	src.push(`
		}
	`);

	return src.join("\n");
};
