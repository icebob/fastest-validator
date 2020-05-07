"use strict";

/**
 * Luhn algorithm checksum https://en.wikipedia.org/wiki/Luhn_algorithm
 * Credit Card numbers, IMEI numbers, National Provider Identifier numbers and others
 * @param value
 * @param schema
 * @return {boolean|{actual, expected, type}|ValidationError}
 *
 *	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	return {
		source: `
			if (typeof value !== "string") {
				${this.makeError({ type: "string",  actual: "value", messages })}
				return value;
			}

			if (typeof value !== "string")
				value = String(value);

			val = value.replace(/\\D+/g, "");

			var array = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
			var len = val ? val.length : 0,
				bit = 1,
				sum = 0;
			while (len--) {
				sum += !(bit ^= 1) ? parseInt(val[len], 10) : array[val[len]];
			}

			if (!(sum % 10 === 0 && sum > 0)) {
				${this.makeError({ type: "luhn",  actual: "value", messages })}
			}

			return value;
		`
	};
};
