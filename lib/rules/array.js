"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema) {
	const src = [];

	src.push(`
		if (!Array.isArray(value)) {
			errors.push({ type: "array", field });
		} else {
			const len = value.length;
	`);

	if (schema.empty === false) {
		src.push(`
			if (len === 0) {
				errors.push({ type: "arrayEmpty", field });
			}
		`);
	}

	if (schema.min != null) {
		src.push(`
			if (len < ${schema.min}) {
				errors.push({ type: "arrayMin", field, expected: ${schema.min}, actual: len });
			}
		`);
	}

	if (schema.max != null) {
		src.push(`
			if (len > ${schema.max}) {
				errors.push({ type: "arrayMax", field, expected: ${schema.max}, actual: len });
			}
		`);
	}

	if (schema.length != null) {
		src.push(`
			if (len !== ${schema.length}) {
				errors.push({ type: "arrayLength", field, expected: ${schema.length}, actual: len });
			}
		`);
	}

	if (schema.contains != null) {
		src.push(`
			if (value.indexOf(${schema.contains}) === -1) {
				errors.push({ type: "arrayContains", field, expected: "${schema.contains}", actual: value });
			}
		`);
	}

	if (schema.enum != null) {
		const enumStr = JSON.stringify(schema.enum);
		src.push(`
			for (let i = 0; i < value.length; i++) {
				if (${enumStr}.indexOf(value[i]) === -1) {
					errors.push({ type: "arrayEnum", field, expected: ${enumStr}, actual: value[i] });
				}
			}
		`);
	}

	src.push(`
		}
	`);

	return src.join("\n");
};
