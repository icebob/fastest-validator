"use strict";

// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

// Regex to escape quoted property names for eval/new Function
const escapeEvalRegex = /["'\\\n\r\u2028\u2029]/g;

/* istanbul ignore next */
function escapeEvalString(str) {
	// Based on https://github.com/joliss/js-string-escape
	return str.replace(escapeEvalRegex, function (character) {
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

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	const sourceCode = [];

	sourceCode.push(`
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			${this.makeError({ type: "object", actual: "value", messages })}
			return value;
		}
	`);

	const subSchema = schema.properties || schema.props;
	if (subSchema) {
		sourceCode.push("var parentObj = value;");
		sourceCode.push("var parentField = field;");

		const keys = Object.keys(subSchema);

		for (let i = 0; i < keys.length; i++) {
			const property = keys[i];

			const name = escapeEvalString(property);
			const safeSubName = identifierRegex.test(name) ? `.${name}` : `['${name}']`;
			const safePropName = `parentObj${safeSubName}`;
			const newPath = (path ? path + "." : "") + property;

			sourceCode.push(`\n// Field: ${escapeEvalString(newPath)}`);
			sourceCode.push(`field = parentField ? parentField + "${safeSubName}" : "${name}";`);
			sourceCode.push(`value = ${safePropName};`);

			const rule = this.getRuleFromSchema(subSchema[property]);
			const innerSource = `
				${safePropName} = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, parentObj, errors, context);
			`;
			sourceCode.push(this.compileRule(rule, context, newPath, innerSource, safePropName));
		}

		// Strict handler
		if (schema.strict) {
			sourceCode.push(`
				if (errors.length === 0) {
			`);
			const allowedProps = Object.keys(subSchema);

			sourceCode.push(`
					field = parentField;
					var invalidProps = [];
					var props = Object.keys(parentObj);

					for (let i = 0; i < props.length; i++) {
						if (${JSON.stringify(allowedProps)}.indexOf(props[i]) === -1) {
							invalidProps.push(props[i]);
						}
					}
					if (invalidProps.length) {
			`);
			if (schema.strict == "remove") {
				sourceCode.push(`
						invalidProps.forEach(function(field) {
							delete parentObj[field];
						});
				`);
			} else {
				sourceCode.push(`
					${this.makeError({ type: "objectStrict", expected: "\"" + allowedProps.join(", ") + "\"", actual: "invalidProps.join(', ')", messages })}
				`);
			}
			sourceCode.push(`
					}
			`);
			sourceCode.push(`
				}
			`);
		}
	}

	if (schema.minProps != null || schema.maxProps != null) {
		// We recalculate props, because:
		//	- if strict equals 'remove', we want to work on
		//	the payload with the extra keys removed,
		//	- if no strict is set, we need them anyway.
		if (schema.strict) {
			sourceCode.push(`
				props = Object.keys(${subSchema ? "parentObj" : "value"});
			`);
		} else {
			sourceCode.push(`
				var props = Object.keys(${subSchema ? "parentObj" : "value"});
				${subSchema ? "field = parentField;" : ""}
			`);
		}
	}

	if (schema.minProps != null) {
		sourceCode.push(`
			if (props.length < ${schema.minProps}) {
				${this.makeError({ type: "objectMinProps", expected: schema.minProps, actual: "props.length", messages })}
			}
		`);
	}

	if (schema.maxProps != null) {
		sourceCode.push(`
			if (props.length > ${schema.maxProps}) {
				${this.makeError({ type: "objectMaxProps", expected: schema.maxProps, actual: "props.length", messages })}
			}
		`);
	}

	if (subSchema) {
		sourceCode.push(`
			return parentObj;
		`);
	} else {
		sourceCode.push(`
			return value;
		`);
	}

	return {
		source: sourceCode.join("\n")
	};
};
