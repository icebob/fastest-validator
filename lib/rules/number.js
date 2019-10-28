"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	const src = [];

	let sanitized = false;
	if (schema.convert === true) {
		sanitized = true;
		src.push(`
			if (typeof value !== "number") {
				value = Number(value);
			}
		`);
	}

	src.push(`
		if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
			${this.makeError({ type: "number", field: path, actual: "value", messages })}
		} else {
	`);

	if (schema.min != null) {
		src.push(`
			if (value < ${schema.min}) {
				${this.makeError({ type: "numberMin", field: path, expected: schema.min, actual: "value", messages })}
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (value > ${schema.max}) {
				${this.makeError({ type: "numberMax", field: path, expected: schema.max, actual: "value", messages })}
			}
		`);
	}

	// Check fix value
	if (schema.equal != null) {
		src.push(`
			if (value !== ${schema.equal}) {
				${this.makeError({ type: "numberEqual", field: path, expected: schema.equal, actual: "value", messages })}
			}
		`);
	}

	// Check not fix value
	if (schema.notEqual != null) {
		src.push(`
			if (value === ${schema.notEqual}) {
				${this.makeError({ type: "numberNotEqual", field: path, expected: schema.notEqual, actual: "value", messages })}
			}
		`);
	}

	// Check integer
	if (schema.integer === true) {
		src.push(`
			if (value % 1 !== 0) {
				${this.makeError({ type: "numberInteger", field: path, actual: "value", messages })}
			}
		`);
	}

	// Check positive
	if (schema.positive === true) {
		src.push(`
			if (value <= 0) {
				${this.makeError({ type: "numberPositive", field: path, actual: "value", messages })}
			}
		`);
	}

	// Check negative
	if (schema.negative === true) {
		src.push(`
			if (value >= 0) {
				return this.makeError("numberNegative", value);
				${this.makeError({ type: "numberNegative", field: path, actual: "value", messages })}
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
