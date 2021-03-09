"use strict";

const NUMERIC_PATTERN = /^-?[0-9]\d*(\.\d+)?$/;
const ALPHA_PATTERN = /^[a-zA-Z]+$/;
const ALPHANUM_PATTERN = /^[a-zA-Z0-9]+$/;
const ALPHADASH_PATTERN = /^[a-zA-Z0-9_-]+$/;
const HEX_PATTERN = /^[0-9a-fA-F]+$/;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function checkString({ schema, messages }, path, context) {
	const src = [];
	let sanitized = false;

	if (schema.convert === true) {
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

	if (schema.padStart) {
		sanitized = true;
		const padChar = schema.padChar != null ? schema.padChar : " ";
		src.push(`
			value = value.padStart(${schema.padStart}, ${JSON.stringify(padChar)});
		`);
	}

	if (schema.padEnd) {
		sanitized = true;
		const padChar = schema.padChar != null ? schema.padChar : " ";
		src.push(`
			value = value.padEnd(${schema.padEnd}, ${JSON.stringify(padChar)});
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
	}

	if (schema.min != null) {
		src.push(`
			if (len < ${schema.min}) {
				${this.makeError({ type: "stringMin", expected: schema.min, actual: "len", messages })}
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (len > ${schema.max}) {
				${this.makeError({ type: "stringMax", expected: schema.max, actual: "len", messages })}
			}
		`);
	}

	if (schema.length != null) {
		src.push(`
			if (len !== ${schema.length}) {
				${this.makeError({ type: "stringLength", expected: schema.length, actual: "len", messages })}
			}
		`);
	}

	if (schema.pattern != null) {
		let pattern = schema.pattern;
		if (typeof schema.pattern == "string")
			pattern = new RegExp(schema.pattern, schema.patternFlags);

		const patternValidator = `
			if (!${pattern.toString()}.test(value))
				${this.makeError({ type: "stringPattern", expected: `"${pattern.toString().replace(/"/g, "\\$&")}"`, actual: "origValue", messages })}
		`;

		src.push(`
			if (${schema.empty} === true && len === 0) {
				// Do nothing
			} else {
				${patternValidator}
			}
		`);
	}

	if (schema.contains != null) {
		src.push(`
			if (value.indexOf("${schema.contains}") === -1) {
				${this.makeError({ type: "stringContains", expected: "\"" + schema.contains + "\"", actual: "origValue", messages })}
			}
		`);
	}

	if (schema.enum != null) {
		const enumStr = JSON.stringify(schema.enum);
		src.push(`
			if (${enumStr}.indexOf(value) === -1) {
				${this.makeError({ type: "stringEnum", expected: "\"" + schema.enum.join(", ") + "\"", actual: "origValue", messages })}
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
