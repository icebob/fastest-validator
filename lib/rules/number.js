"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function checkNumber(schema) {
	const src = [];

	if (schema.convert === true) {
		src.push(`
			if (typeof value !== "number") {
				value = Number(value);
			}
		`);
	}

	src.push(`
		if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
			errors.push({ type: "number", field });
		} else {
	`);

	if (schema.min != null) {
		src.push(`
			if (value < ${schema.min}) {
				errors.push({ type: "numberMin", field, expected: ${schema.min}, actual: value });
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (value > ${schema.max}) {
				errors.push({ type: "numberMax", field, expected: ${schema.max}, actual: value });
			}
		`);
	}

	// Check fix value
	if (schema.equal != null) {
		src.push(`
			if (value !== ${schema.equal}) {
				errors.push({ type: "numberEqual", field, expected: ${schema.equal}, actual: value });
			}
		`);
	}

	// Check not fix value
	if (schema.notEqual != null) {
		src.push(`
			if (value === ${schema.notEqual}) {
				errors.push({ type: "numberNotEqual", field, expected: ${schema.notEqual}, actual: value });
			}
		`);
	}

	// Check integer
	if (schema.integer === true) {
		src.push(`
			if (value % 1 !== 0) {
				errors.push({ type: "numberInteger", field, expected: "An integer number", actual: value });
			}
		`);
	}

	// Check positive
	if (schema.positive === true) {
		src.push(`
			if (value <= 0) {
				errors.push({ type: "numberPositive", field, expected: "A positive number", actual: value });
			}
		`);
	}

	// Check negative
	if (schema.negative === true) {
		src.push(`
			if (value >= 0) {
				return this.makeError("numberNegative", value);
				errors.push({ type: "numberNegative", field, expected: "A negative number", actual: value });
			}
		`);
	}

	src.push(`
		}
	`);

	return src.join("\n");
};
