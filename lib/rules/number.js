"use strict";

const {
	assertNumber,
	assertBoolean,
} = require("../helpers/schema-options");

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const convert = schema.convert != null ? assertBoolean("number", "convert", schema.convert) : undefined;
	const min = schema.min != null ? assertNumber("number", "min", schema.min) : undefined;
	const max = schema.max != null ? assertNumber("number", "max", schema.max) : undefined;
	const equal = schema.equal != null ? assertNumber("number", "equal", schema.equal) : undefined;
	const notEqual = schema.notEqual != null ? assertNumber("number", "notEqual", schema.notEqual) : undefined;
	const integer = schema.integer != null ? assertBoolean("number", "integer", schema.integer) : undefined;
	const positive = schema.positive != null ? assertBoolean("number", "positive", schema.positive) : undefined;
	const negative = schema.negative != null ? assertBoolean("number", "negative", schema.negative) : undefined;
	const step = schema.step != null ? assertNumber("number", "step", schema.step, { positive: true }) : undefined;

	const src = [];

	src.push(`
		var origValue = value;
	`);

	let sanitized = false;
	if (convert === true) {
		sanitized = true;
		src.push(`
			if (typeof value !== "number") {
				value = Number(value);
			}
		`);
	}

	src.push(`
		if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
			${this.makeError({ type: "number", actual: "origValue", messages })}
			return value;
		}
	`);

	if (min != null) {
		src.push(`
			if (value < ${min}) {
				${this.makeError({ type: "numberMin", expected: min, actual: "origValue", messages })}
			}
		`);
	}

	if (max != null) {
		src.push(`
			if (value > ${max}) {
				${this.makeError({ type: "numberMax", expected: max, actual: "origValue", messages })}
			}
		`);
	}

	// Check fix value
	if (equal != null) {
		src.push(`
			if (value !== ${equal}) {
				${this.makeError({ type: "numberEqual", expected: equal, actual: "origValue", messages })}
			}
		`);
	}

	// Check not fix value
	if (notEqual != null) {
		src.push(`
			if (value === ${notEqual}) {
				${this.makeError({ type: "numberNotEqual", expected: notEqual, actual: "origValue", messages })}
			}
		`);
	}

	// Check integer
	if (integer === true) {
		src.push(`
			if (value % 1 !== 0) {
				${this.makeError({ type: "numberInteger", actual: "origValue", messages })}
			}
		`);
	}

	// Check step
	if (step != null) {
		const errorSrc = this.makeError({ type: "numberStep", expected: step, actual: "origValue", messages });

		if (Number.isInteger(step)) 
			src.push(`
				if (value % ${step} !== 0) {
					${errorSrc}
				}
			`);
		else {
			const stepDecimals = (step.toString().split(".")[1] || "").length;
			const multiplier = Math.pow(10, stepDecimals);
			const stepInt = Math.round(step * multiplier);

			src.push(`
				if (!Number.isFinite(value)) {
					${errorSrc}
				} else {
					const valStr = value.toString();
					const valDotIdx = valStr.indexOf('.');
					const valDecimals = valDotIdx !== -1 ? valStr.length - valDotIdx - 1 : 0;

					if (valDecimals > ${stepDecimals}) {
						${errorSrc}
					} else {
						const valInt = Math.round(value * ${multiplier});
	
						if (valInt % ${stepInt} !== 0) {
							${errorSrc}
						}
					}
				}
			`);
		}
	}

	// Check positive
	if (positive === true) {
		src.push(`
			if (value <= 0) {
				${this.makeError({ type: "numberPositive", actual: "origValue", messages })}
			}
		`);
	}

	// Check negative
	if (negative === true) {
		src.push(`
			if (value >= 0) {
				${this.makeError({ type: "numberNegative", actual: "origValue", messages })}
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
