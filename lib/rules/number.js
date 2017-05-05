"use strict";

module.exports = function checkNumber(value, schema) {
	if (schema.convert === true && typeof value !== "number") {
		value = Number(value);
	}

	if (typeof value !== "number") {
		return this.makeError("number");
	}

	if (isNaN(value) || !isFinite(value)) {
		return this.makeError("number");
	}

	if (schema.min != null && value < schema.min) {
		return this.makeError("numberMin", schema.min, value);
	}

	if (schema.max != null && value > schema.max) {
		return this.makeError("numberMax", schema.max, value);
	}

	// Check fix value
	if (schema.equal != null && value !== schema.equal) {
		return this.makeError("numberEqual", schema.equal, value);
	}	

	// Check not fix value
	if (schema.notEqual != null && value === schema.notEqual) {
		return this.makeError("numberNotEqual", schema.notEqual);
	}	

	// Check integer
	if (schema.integer === true && value % 1 !== 0) {
		return this.makeError("numberInteger", value);
	}	

	// Check positive
	if (schema.positive === true && value <= 0) {
		return this.makeError("numberPositive", value);
	}	

	// Check negative
	if (schema.negative === true && value >= 0) {
		return this.makeError("numberNegative", value);
	}

	return true;
};