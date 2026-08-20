"use strict";
const {
	assertString,
	assertBoolean,
	toRegExp,
	escapeRegExp,
} = require("../helpers/schema-options");
const CURRENCY_REGEX = "(?=.*\\d)^(-?~1|~1-?)(([0-9]\\d{0,2}(~2\\d{3})*)|0)?(~3\\d{1,2})?$";

module.exports = function ({schema, messages}) {
	const currencySymbol = schema.currencySymbol != null
		? assertString("currency", "currencySymbol", schema.currencySymbol)
		: null;
	const thousandSeparator = schema.thousandSeparator != null
		? assertString("currency", "thousandSeparator", schema.thousandSeparator)
		: ",";
	const decimalSeparator = schema.decimalSeparator != null
		? assertString("currency", "decimalSeparator", schema.decimalSeparator)
		: ".";
	const symbolOptional = schema.symbolOptional != null
		? assertBoolean("currency", "symbolOptional", schema.symbolOptional)
		: false;
	const customPattern = schema.customRegex != null
		? toRegExp("currency", "customRegex", schema.customRegex)
		: null;

	const isCurrencySymbolMandatory = !symbolOptional;

	let embeddedRegex;
	if (customPattern) {
		embeddedRegex = `new RegExp(${customPattern.expression}, ${customPattern.flags})`;
	} else {
		const finalRegex = CURRENCY_REGEX
			.replace(/~1/g, currencySymbol ? (`${escapeRegExp(currencySymbol)}${isCurrencySymbolMandatory ? "" : "?"}`) : "")
			.replace("~2", escapeRegExp(thousandSeparator))
			.replace("~3", escapeRegExp(decimalSeparator));
		embeddedRegex = new RegExp(finalRegex).toString();
	}

	const src = [];

	src.push(`
		if (!value.match(${embeddedRegex})) {
			${this.makeError({ type: "currency", actual: "value", messages })}
			return value;
		}

		return value;
	`);

	return {
		source: src.join("\n")
	};
};
