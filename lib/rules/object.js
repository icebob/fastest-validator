"use strict";

const { assertNonNegativeInteger, escapeLineComment, safeStringLiteral } = require("../helpers/schema-options");

// Quick regex to match most common unquoted JavaScript property names. Note the spec allows Unicode letters.
// Unmatched property names will be quoted and validate slighly slower. https://www.ecma-international.org/ecma-262/5.1/#sec-7.6
const identifierRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	const minProps = schema.minProps != null ? assertNonNegativeInteger("object", "minProps", schema.minProps) : undefined;
	const maxProps = schema.maxProps != null ? assertNonNegativeInteger("object", "maxProps", schema.maxProps) : undefined;

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

		const keys = Object.keys(subSchema).filter(key => !this.isMetaKey(key));

		for (let i = 0; i < keys.length; i++) {
			const property = keys[i];
			const rule = this.getRuleFromSchema(subSchema[property]);
			
			const safeSubName = identifierRegex.test(property) ? `.${property}` : `[${safeStringLiteral(property)}]`;
			const safePropName = `parentObj${safeSubName}`;
			const newPath = (path ? path + "." : "") + property;

			const labelName = rule.schema.label;
			const label = labelName != null ? safeStringLiteral(labelName) : "null";

			sourceCode.push(`\n// Field: ${escapeLineComment(newPath)}`);
			sourceCode.push(`field = parentField ? parentField + ${safeStringLiteral(safeSubName)} : ${safeStringLiteral(property)};`);
			sourceCode.push(`value = ${safePropName};`);
			sourceCode.push(`label = ${label}`);
			const innerSource = `
				${safePropName} = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field, parentObj, errors, context, label);
			`;
			sourceCode.push(this.compileRule(rule, context, newPath, innerSource, safePropName));
			if (this.opts.haltOnFirstError === true) {
				sourceCode.push("if (errors.length) return parentObj;");
			}
		}

		// Strict handler
		if (schema.strict) {
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
			if (schema.strict === "remove") {
				sourceCode.push(`
					if (errors.length === 0) {
				`);
				sourceCode.push(`
						invalidProps.forEach(function(field) {
							delete parentObj[field];
						});
				`);
				sourceCode.push(`
					}
				`);
			} else {
				sourceCode.push(`
					${this.makeError({ type: "objectStrict", expected: "\"" + allowedProps.join(", ") + "\"", actual: "invalidProps.join(', ')", messages })}
				`);
			}
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
			if (props.length < ${minProps}) {
				${this.makeError({ type: "objectMinProps", expected: minProps, actual: "props.length", messages })}
			}
		`);
	}

	if (schema.maxProps != null) {
		sourceCode.push(`
			if (props.length > ${maxProps}) {
				${this.makeError({ type: "objectMaxProps", expected: maxProps, actual: "props.length", messages })}
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
