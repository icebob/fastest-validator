"use strict";
const CURRENCY_REGEX = `(?=.*\\\\d)^~1(([0-9]\\\\d{0,2}(,\\\\d{3})*)|0)?(\\\\.\\\\d{1,2})?$`;
/**	Signature: function(value, field, parent, errors, context)
 */

module.exports = function ({schema, messages}, path, context) {
	const currencySymbol = schema.currencySymbol || null;
	let isCurrencySymbolMandatory = !schema.symbolOptional;
	let finalRegex = CURRENCY_REGEX.replace('~1', currencySymbol ? (`\\\\${currencySymbol}${(isCurrencySymbolMandatory ? '' : '?')}`) : '');
	return {
		source: `
			if (!value.match(new RegExp('${finalRegex}'))){
			return ${this.makeError({
			type: "currency",
			actual: "value",
			messages
		})}
			}
			return value;
		`
	};
};
