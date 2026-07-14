"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	const src = [];

	src.push(`
		var origValue = value;
	`);

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
			${this.makeError({ type: "number", actual: "origValue", messages })}
			return value;
		}
	`);

	if (schema.min != null) {
		src.push(`
			if (value < ${schema.min}) {
				${this.makeError({ type: "numberMin", expected: schema.min, actual: "origValue", messages })}
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (value > ${schema.max}) {
				${this.makeError({ type: "numberMax", expected: schema.max, actual: "origValue", messages })}
			}
		`);
	}

	// Check fix value
	if (schema.equal != null) {
		src.push(`
			if (value !== ${schema.equal}) {
				${this.makeError({ type: "numberEqual", expected: schema.equal, actual: "origValue", messages })}
			}
		`);
	}

	// Check not fix value
	if (schema.notEqual != null) {
		src.push(`
			if (value === ${schema.notEqual}) {
				${this.makeError({ type: "numberNotEqual", expected: schema.notEqual, actual: "origValue", messages })}
			}
		`);
	}

	// Check integer
	if (schema.integer === true) {
		src.push(`
			if (value % 1 !== 0) {
				${this.makeError({ type: "numberInteger", actual: "origValue", messages })}
			}
		`);
	}

	// Check step
	if (schema.step != null) {
		if (schema.step <= 0 || !Number.isFinite(schema.step))
			throw new Error(`Invalid '${schema.type}' schema. The 'step' field must be a positive number.`);
		
		const errorSrc = this.makeError({ type: "numberStep", expected: schema.step, actual: "origValue", messages });

		if (Number.isInteger(schema.step)) 
			src.push(`
				if (value % ${schema.step} !== 0) {
					${errorSrc}
				}
			`)
		else {
			const stepDecimals = schema.step.toString().split('.')[1].length
			const multiplier = Math.pow(10, stepDecimals);
			const stepInt = Math.round(schema.step * multiplier);

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
	if (schema.positive === true) {
		src.push(`
			if (value <= 0) {
				${this.makeError({ type: "numberPositive", actual: "origValue", messages })}
			}
		`);
	}

	// Check negative
	if (schema.negative === true) {
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
