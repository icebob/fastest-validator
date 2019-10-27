"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema) {
	const src = [];

	src.push(`
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			errors.push({ type: "object", field });
		} else {
	`);

	if (schema.strict === true && schema.props) {
		const allowedProps = Object.keys(schema.props);

		src.push(`
			const invalidProps = [];
			const props = Object.keys(value);

			for (let i = 0; i < props.length; i++) {
				if (${JSON.stringify(allowedProps)}.indexOf(props[i]) === -1) {
					invalidProps.push(props[i]);
				}
			}
			if (invalidProps.length) {
				errors.push({ type: "objectStrict", field, expected: "${allowedProps.join(", ")}", actual: invalidProps.join(", ") });
			}
		`);
	}

	src.push(`
		}
	`);

	return src.join("\n");
};
