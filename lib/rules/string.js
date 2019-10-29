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
module.exports = function checkString(schema, path, messages) {
	const src = [];
	let sanitized = false;
	src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string", field: path, actual: "origValue", messages })}
		} else {
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
			const len = value.length;
	`);

	if (schema.empty === false) {
		src.push(`
			if (len === 0) {
				${this.makeError({ type: "stringEmpty", field: path, messages })}
			}
		`);
	}

	if (schema.min != null) {
		src.push(`
			if (len < ${schema.min}) {
				${this.makeError({ type: "stringMin", field: path, expected: schema.min, actual: "len", messages })}
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (len > ${schema.max}) {
				${this.makeError({ type: "stringMax", field: path, expected: schema.max, actual: "len", messages })}
			}
		`);
	}

	if (schema.length != null) {
		src.push(`
			if (len !== ${schema.length}) {
				${this.makeError({ type: "stringLength", field: path, expected: schema.length, actual: "len", messages })}
			}
		`);
	}

	if (schema.pattern != null) {
		src.push(`
			if (!${schema.pattern}.test(value))
				${this.makeError({ type: "stringPattern", field: path, expected: "\"" + schema.pattern + "\"", actual: "origValue", messages })}
		`);
	}

	if (schema.contains != null) {
		src.push(`
			if (value.indexOf("${schema.contains}") === -1) {
				${this.makeError({ type: "stringContains", field: path, expected: "\"" + schema.contains + "\"", actual: "origValue", messages })}
			}
		`);
	}

	if (schema.enum != null) {
		const enumStr = JSON.stringify(schema.enum);
		src.push(`
			if (${enumStr}.indexOf(value) === -1) {
				${this.makeError({ type: "stringEnum", field: path, expected: "\"" + schema.enum.join(", ") + "\"", actual: "origValue", messages })}
			}
		`);
	}

	if (schema.numeric === true) {
		src.push(`
			if (!${NUMERIC_PATTERN.toString()}.test(value) ) {
				${this.makeError({ type: "stringNumeric", field: path, actual: "origValue", messages })}
			}
		`);
	}

	if(schema.alpha === true) {
		src.push(`
			if(!${ALPHA_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlpha", field: path, actual: "origValue", messages })}
			}
		`);
	}

	if(schema.alphanum === true) {
		src.push(`
			if(!${ALPHANUM_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlphanum", field: path, actual: "origValue", messages })}
			}
		`);
	}

	if(schema.alphadash === true) {
		src.push(`
			if(!${ALPHADASH_PATTERN.toString()}.test(value)) {
				${this.makeError({ type: "stringAlphadash", field: path, actual: "origValue", messages })}
			}
		`);
	}

	src.push(`
		}
	`);

	return {
		sanitized,
		source: src.join("\n")
	};
};
