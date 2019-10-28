"use strict";

// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

// Regex to escape quoted property names for eval/new Function
const escapeEvalRegex = /["'\\\n\r\u2028\u2029]/g;

function escapeEvalString(str) {
	// Based on https://github.com/joliss/js-string-escape
	return str.replace(escapeEvalRegex, function(character) {
		switch (character) {
		case "\"":
		case "'":
		case "\\":
			return "\\" + character;
			// Four possible LineTerminator characters need to be escaped:
		case "\n":
			return "\\n";
		case "\r":
			return "\\r";
		case "\u2028":
			return "\\u2028";
		case "\u2029":
			return "\\u2029";
		}
	});
}

/**	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path, messages, context) {
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

			const name = escapeEvalString(property);
			const safePropName = identifierRegex.test(name) ? `parent.${name}` : `parent["${name}"]`;
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

			const res = rule.ruleFunction.call(this, rule.schema, newPath, rule.messages, context);
			if (res.source)
				src.push(res.source);

			if (res.sanitized) {
				src.push(`${safePropName} = value;`);
			}

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
					${this.makeError({ type: "objectStrict", field: path, expected: "\"" + allowedProps.join(", ") + "\"", actual: "invalidProps.join(', ')", messages })}
				}
			`);
		}
	}

	src.push(`
		}
	`);

	return {
		source: src.join("\n")
	};
};
