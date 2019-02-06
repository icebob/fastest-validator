"use strict";

const NUMERIC_PATTERN = /^-?[0-9]\d*(\.\d+)?$/;
const ALPHA_PATTERN = /^[a-zA-Z]+$/;
const ALPHANUM_PATTERN = /^[a-zA-Z0-9]+$/;
const ALPHADASH_PATTERN = /^[a-zA-Z0-9_-]+$/;

module.exports = function checkString(value, schema) {
	if (typeof value !== "string") {
		return this.makeError("string");
	}

	const valueLength = value.length;

	if (schema.empty === false && valueLength === 0) {
		return this.makeError("stringEmpty");
	}

	if (schema.min != null && valueLength < schema.min) {
		return this.makeError("stringMin", schema.min, valueLength);
	}

	if (schema.max != null && valueLength > schema.max) {
		return this.makeError("stringMax", schema.max, valueLength);
	}

	if (schema.length != null && valueLength !== schema.length) {
		return this.makeError("stringLength", schema.length, valueLength);
	}

	if (schema.pattern != null) {
		const pattern = typeof schema.pattern == "string" ? new RegExp(schema.pattern, schema.patternFlags) : schema.pattern;
		if (!pattern.test(value))
			return this.makeError("stringPattern", pattern );
	}

	if (schema.contains != null && value.indexOf(schema.contains) === -1) {
		return this.makeError("stringContains", schema.contains);
	}

	if (schema.enum != null && schema.enum.indexOf(value) === -1) {
		return this.makeError("stringEnum", schema.enum);
	}

	if (schema.numeric === true && !NUMERIC_PATTERN.test(value) ) {
		return this.makeError("stringNumeric", "A numeric string", value);
	}

	if(schema.alpha === true && !ALPHA_PATTERN.test(value)) {
		return this.makeError("stringAlpha", "An alphabetic string", value);
	}

	if(schema.alphanum === true && !ALPHANUM_PATTERN.test(value)) {
		return this.makeError("stringAlphanum", "An alphanumeric string", value);
	}

	if(schema.alphadash === true && !ALPHADASH_PATTERN.test(value)) {
		return this.makeError("stringAlphadash", "An alphadash string", value);
	}

	return true;
};
