"use strict";

const PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema) {
	const src = [];
	src.push(`
		if (typeof value !== "string") {
			errors.push({ type: "string", field, actual: value });
		} else {

			val = value.toLowerCase();
			if (!PATTERN.test(val)) {
				errors.push({ type: "uuid", field, actual: value });
			} else {
				const version = val.charAt(14) | 0;

	`);

	if(schema.version) {
		src.push(`
				if (schema.version !== version)
					errors.push({ type: "uuidVersion", field, expected: ${schema.version}, actual: version });
		`);
	}

	src.push(`
				switch (version) {
				case 1:
				case 2:
					break;
				case 3:
				case 4:
				case 5:
					if (["8", "9", "a", "b"].indexOf(value.charAt(19)) === -1) {
						errors.push({ type: "uuid", field, actual: value });
					}
				}
			}
		}
	`);
};
