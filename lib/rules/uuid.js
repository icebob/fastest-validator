"use strict";

const PATTERN = /^([0-9a-f]{8}-[0-9a-f]{4}-[1-6][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}|[0]{8}-[0]{4}-[0]{4}-[0]{4}-[0]{12})$/i;

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path) {
	const src = [];
	src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string",  actual: "value", messages })}
			return value;
		}

		var val = value.toLowerCase();
		if (!${PATTERN.toString()}.test(val)) {
			${this.makeError({ type: "uuid",  actual: "value", messages })}
			return value;
		}

		const version = val.charAt(14) | 0;
	`);

	if(parseInt(schema.version) < 7) {
		src.push(`
			if (${schema.version} !== version) {
				${this.makeError({ type: "uuidVersion", expected: schema.version, actual: "version", messages })}
				return value;
			}
		`);
	}

	src.push(`
		switch (version) {
		case 0:
		case 1:
		case 2:
		case 6:
			break;
		case 3:
		case 4:
		case 5:
			if (["8", "9", "a", "b"].indexOf(val.charAt(19)) === -1) {
				${this.makeError({ type: "uuid",  actual: "value", messages })}
			}
		}

		return value;
	`);

	return {
		source: src.join("\n")
	};
};
