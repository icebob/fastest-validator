"use strict";

const {
	assertNumber,
	assertNonNegativeInteger,
	assertString,
	assertBoolean,
	assertArray,
	safeStringLiteral,
	toRegExp,
} = require("../helpers/schema-options");
const NUMERIC_PATTERN = /^-?[0-9]\d*(\.\d+)?$/;
const ALPHA_PATTERN = /^[a-zA-Z]+$/;
const ALPHANUM_PATTERN = /^[a-zA-Z0-9]+$/;
const ALPHADASH_PATTERN = /^[a-zA-Z0-9_-]+$/;
const HEX_PATTERN = /^[0-9a-fA-F]+$/;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function checkString({ schema, messages }, path, context) {
	const convert = schema.convert != null ? assertBoolean("string", "convert", schema.convert) : undefined;
	const min = schema.min != null ? assertNumber("string", "min", schema.min) : undefined;
	const max = schema.max != null ? assertNumber("string", "max", schema.max) : undefined;
	const length = schema.length != null ? assertNonNegativeInteger("string", "length", schema.length) : undefined;
	const contains = schema.contains != null ? assertString("string", "contains", schema.contains) : undefined;
	const pattern = schema.pattern != null ? toRegExp("string", "pattern", schema.pattern, { flags: schema.patternFlags }) : undefined;
	const padStart = schema.padStart != null ? assertNonNegativeInteger("string", "padStart", schema.padStart) : undefined;
	const padEnd = schema.padEnd != null ? assertNonNegativeInteger("string", "padEnd", schema.padEnd) : undefined;
	const padChar = schema.padChar != null ? assertString("string", "padChar", schema.padChar) : undefined;
	const enumValues = schema.enum != null ? assertArray("string", "enum", schema.enum) : undefined;
	const src = [];
	let sanitized = false;

	if (convert === true) {
		sanitized = true;
		src.push(`
			if (typeof value !== "string") {
				value = String(value);
			}
		`);
	}

	src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string", actual: "value", messages })}
			return value;
		}

		var origValue = value;
	`);

	if (schema.trim) {
		sanitized = true;
		src.push(`
			value = value.trim();
		`);
	}

	if (schema.trimLeft) {
		sanitized = true;
		src.push(`
			value = value.trimLeft();
		`);
	}

	if (schema.trimRight) {
		sanitized = true;
		src.push(`
			value = value.trimRight();
		`);
	}

	if (padStart != null) {
		sanitized = true;
		src.push(`
			value = value.padStart(${padStart}, ${JSON.stringify(padChar != null ? padChar : " ")});
		`);
	}

	if (padEnd != null) {
		sanitized = true;
		src.push(`
			value = value.padEnd(${padEnd}, ${JSON.stringify(padChar != null ? padChar : " ")});
		`);
	}

	if (schema.lowercase) {
		sanitized = true;
		src.push(`
			value = value.toLowerCase();
		`);
	}

	if (schema.uppercase) {
		sanitized = true;
		src.push(`
			value = value.toUpperCase();
		`);
	}

	if (schema.localeLowercase) {
		sanitized = true;
		src.push(`
			value = value.toLocaleLowerCase();
		`);
	}

	if (schema.localeUppercase) {
		sanitized = true;
		src.push(`
			value = value.toLocaleUpperCase();
		`);
	}

	src.push(`
			var len = value.length;
	`);

	if (schema.empty === false) {
		src.push(`
			if (len === 0) {
				${this.makeError({ type: "stringEmpty",  actual: "value", messages })}
			}
		`);
	} else if (schema.empty === true) {
		src.push(`
			if (len === 0) {
				return value;
			}
		`);
	}

	if (min != null) {
		src.push(`
			if (len < ${min}) {
				${this.makeError({ type: "stringMin", expected: min, actual: "len", messages })}
			}
		`);
	}

	if (max != null) {
		src.push(`
			if (len > ${max}) {
				${this.makeError({ type: "stringMax", expected: max, actual: "len", messages })}
			}
		`);
	}

	if (length != null) {
		src.push(`
			if (len !== ${length}) {
				${this.makeError({ type: "stringLength", expected: length, actual: "len", messages })}
			}
		`);
	}

	if (pattern != null) {
		const patternRe = `new RegExp(${pattern.expression}, ${pattern.flags})`;
		src.push(`
			var patternRe = ${patternRe};
			if (!patternRe.test(value)) {
				${this.makeError({ type: "stringPattern", expected: "patternRe.toString()", actual: "origValue", messages })}
			}
		`);
	}

	if (contains != null) {
		const safeContains = JSON.stringify(contains);
		src.push(`
			if (value.indexOf(${safeContains}) === -1) {
				${this.makeError({
		type: "stringContains",
		expected: safeContains,
		actual: "origValue",
		messages
	})}
			}
		`);
	}

	if (enumValues != null) {
		const enumStr = JSON.stringify(enumValues);
		src.push(`
			if (${enumStr}.indexOf(value) === -1) {
				${this.makeError({ type: "stringEnum", expected: safeStringLiteral(enumValues.join(", ")), actual: "origValue", messages })}
			}
		`);
	}

	if (schema.numeric === true) {
		src.push(`
			if (!${NUMERIC_PATTERN.toString()}.test(value) ) {
				${this.makeError({ type: "stringNumeric",  actual: "origValue", messages })}
			}
		`);
	}

	if(schema.alpha === true) {
		src.push(`
			if(!${ALPHA_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlpha",  actual: "origValue", messages })}
			}
		`);
	}

	if(schema.alphanum === true) {
		src.push(`
			if(!${ALPHANUM_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlphanum",  actual: "origValue", messages })}
			}
		`);
	}

	if(schema.alphadash === true) {
		src.push(`
			if(!${ALPHADASH_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlphadash",  actual: "origValue", messages })}
			}
		`);
	}

	if(schema.hex === true) {
		src.push(`
			if(value.length % 2 !== 0 || !${HEX_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringHex",  actual: "origValue", messages })}
			}
		`);
	}

	if(schema.singleLine === true) {
		src.push(`
			if(value.includes("\\n")) {
				${this.makeError({ type: "stringSingleLine", messages })}
			}
		`);
	}


	if(schema.base64 === true) {
		src.push(`
			if(!${BASE64_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringBase64",  actual: "origValue", messages })}
			}
		`);
	}

	src.push(`
		return value;
	`);

	return {
		sanitized,
		source: src.join("\n")
	};
};
