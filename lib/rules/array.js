"use strict";

module.exports = function checkArray(value, schema) {
	if (!Array.isArray(value)) {
		return this.makeError("array");
	}

	const arrLength = value.length;

	if (schema.empty === false && arrLength === 0) {
		return this.makeError("arrayEmpty");
	}

	if (schema.min != null && arrLength < schema.min) {
		return this.makeError("arrayMin", schema.min, arrLength);
	}

	if (schema.max != null && arrLength > schema.max) {
		return this.makeError("arrayMax", schema.max, arrLength);
	}

	// Check fix length
	if (schema.length != null && arrLength !== schema.length) {
		return this.makeError("arrayLength", schema.length, arrLength);
	}	

	if (schema.contains != null && value.indexOf(schema.contains) === -1) {
		return this.makeError("arrayContains", schema.contains);
	}	

	if (schema.enum != null) {
		for (let i = 0; i < value.length; i++) {
			if (schema.enum.indexOf(value[i]) === -1) {
				return this.makeError("arrayEnum", value[i], schema.enum);
			}
		}
	}	

	return true;
};