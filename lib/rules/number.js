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
			${this.makeError({ type: "number",  actual: "origValue", messages })}
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
				${this.makeError({ type: "numberInteger",  actual: "origValue", messages })}
			}
		`);
	}

	// Check positive
	if (schema.positive === true) {
		src.push(`
			if (value <= 0) {
				${this.makeError({ type: "numberPositive",  actual: "origValue", messages })}
			}
		`);
	}

	// Check negative
	if (schema.negative === true) {
		src.push(`
			if (value >= 0) {
				${this.makeError({ type: "numberNegative",  actual: "origValue", messages })}
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
