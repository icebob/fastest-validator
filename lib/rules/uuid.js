"use strict";

const PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	const src = [];
	src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string", field: path, actual: "value", messages })}
		} else {

			val = value.toLowerCase();
			if (!PATTERN.test(val)) {
				${this.makeError({ type: "uuid", field: path, actual: "value", messages })}
			} else {
				const version = val.charAt(14) | 0;

	`);

	if(schema.version) {
		src.push(`
				if (schema.version !== version) {
					${this.makeError({ type: "uuidVersion", field: path, expected: schema.version, actual: "value", messages })}
				}
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
						${this.makeError({ type: "uuid", field: path, actual: "value", messages })}
					}
				}
			}
		}
	`);
};
