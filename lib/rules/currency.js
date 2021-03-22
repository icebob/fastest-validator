"use strict";
const CURRENCY_REGEX = "(?=.*\\d)^(-?~1|~1-?)(([0-9]\\d{0,2}(~2\\d{3})*)|0)?(\\~3\\d{1,2})?$";
/**	Signature: function(value, field, parent, errors, context)
 */

module.exports = function ({schema, messages}, path, context) {
	const currencySymbol = schema.currencySymbol || null;
	const thousandSeparator = schema.thousandSeparator || ",";
	const decimalSeparator = schema.decimalSeparator || ".";
	const customRegex = schema.customRegex;
	let isCurrencySymbolMandatory = !schema.symbolOptional;
	let finalRegex = CURRENCY_REGEX.replace(/~1/g, currencySymbol ? (`\\${currencySymbol}${(isCurrencySymbolMandatory ? "" : "?")}`) : "")
		.replace("~2", thousandSeparator)
		.replace("~3", decimalSeparator);


	const src = [];

	src.push(`
		if (!value.match(${customRegex || new RegExp(finalRegex)})) {
			${this.makeError({ type: "currency", actual: "value", messages })}
			return value;
		}

		return value;
	`);

	return {
		source: src.join("\n")
	};
};
