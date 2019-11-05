"use strict";

// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

// Regex to escape quoted property names for eval/new Function
const escapeEvalRegex = /["'\\\n\r\u2028\u2029]/g;

/* istanbul ignore next */
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
	const sourceCode = [];

	sourceCode.push(`
		if (typeof value !== "object" || value === null || Array.isArray(value))
			return ${this.makeError({ type: "object",  actual: "value", messages })}
	`);

	const subSchema = schema.properties || schema.props;
	if (subSchema) {
		sourceCode.push("var field;");
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

			const rule = this.compileSchemaRule(subSchema[property]);

			const res = rule.ruleFunction.call(this, rule.schema, newPath, rule.messages, context);
			if (res.source) {
				const fn = new Function("value", "field", "parent", "errors", "context", res.source);
				context.fn[context.index] = fn;
				sourceCode.push(this.wrapRequiredCheckSourceCode(rule, `
					${safePropName} = context.fn[${context.index}](value, field, parentObj, errors, context);
				`));
				context.index++;
			} else {
				sourceCode.push(this.wrapRequiredCheckSourceCode(rule));
			}
		}

		// Strict handler
		if (schema.strict === true) {
			const allowedProps = Object.keys(subSchema);

			sourceCode.push(`
				var invalidProps = [];
				var props = Object.keys(value);

				for (let i = 0; i < props.length; i++) {
					if (${JSON.stringify(allowedProps)}.indexOf(props[i]) === -1) {
						invalidProps.push(props[i]);
					}
				}
				if (invalidProps.length) {
					${this.makeError({ type: "objectStrict", expected: "\"" + allowedProps.join(", ") + "\"", actual: "invalidProps.join(', ')", messages })}
				}
			`);
		}
	}

	return {
		source: sourceCode.join("\n")
	};
};
