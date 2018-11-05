"use strict";

module.exports = function checkString(value, schema) {
	if (typeof value !== "string") {
		return this.makeError("string");
	}

	/* TODO: charset
	 	alpha: /^[a-zA-Z]+$/
		alphaNum: /^[a-zA-Z0-9]+$/
		alphaDash: /^[a-zA-Z0-9_\-]+$/

	*/

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

	return true;
};