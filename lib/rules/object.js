"use strict";

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages) {
	const src = [];

	src.push(`
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			${this.makeError({ type: "object", field: path, actual: "value", messages })}
		} else {
	`);

	const subSchema = schema.properties || schema.props;
	if (subSchema) {
		src.push("let parent = value;");

		const keys = Object.keys(subSchema);

		for (let i = 0; i < keys.length; i++) {
			const property = keys[i];

			const name = this.escapeEvalString(property);
			const safePropName = this.identifierRegex.test(name) ? `parent.${name}` : `parent["${name}"]`;
			const newPath = (path ? path + "." : "") + property;
			//const valueName = `value_${cnt}`;

			src.push(`\n// Field: ${newPath}`);
			src.push("if (true) {");
			src.push(`\tlet field = "${name}";`);
			src.push(`\tlet value = ${safePropName};`);

			const rule = this.compileSchemaRule(subSchema[property]);

			// Required, optional, forbidden
			if (rule.schema.optional === true || rule.schema.type == "forbidden") {
				// Optional field
				src.push(`
				if (value === undefined || value === null) {
					// Do nothing
				} else {`);
			} else {
				// Required field
				src.push(`
				if (value === undefined || value === null) {
					${this.makeError({ type: "required", field: newPath, actual: "value", messages })}
				} else {`);
			}

			src.push(rule.ruleFunction.call(this, rule.schema, newPath, rule.messages));

			src.push("\t}"); // Required, optional
			src.push("}"); // if (true)
		}

		// Strict handler
		if (schema.strict === true) {
			const allowedProps = Object.keys(subSchema);

			src.push(`
				const invalidProps = [];
				const props = Object.keys(value);

				for (let i = 0; i < props.length; i++) {
					if (${JSON.stringify(allowedProps)}.indexOf(props[i]) === -1) {
						invalidProps.push(props[i]);
					}
				}
				if (invalidProps.length) {
					${this.makeError({ type: "objectStrict", field: path, expected: allowedProps.join(", "), actual: "invalidProps.join(', ')", messages })}
				}
			`);
		}
	}

	src.push(`
		}
	`);

	return src.join("\n");
};
