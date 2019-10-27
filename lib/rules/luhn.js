"use strict";

/**
 * Luhn algorithm checksum https://en.wikipedia.org/wiki/Luhn_algorithm
 * Credit Card numbers, IMEI numbers, National Provider Identifier numbers and others
 * @param value
 * @param schema
 * @return {boolean|{actual, expected, type}|ValidationError}
 *
 *	Available variables:
 * 		- `value`
 * 		- `field`
 * 		- `errors`
 */
module.exports = function(schema, path) {
	return `
		if (typeof value !== "string") {
			errors.push({ type: "string", field: "${path}" });
		} else {
			if (typeof value !== "string")
				value = String(value);

			val = value.replace(/\\D+/g, "");

			const array = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
			let len = val ? val.length : 0,
				bit = 1,
				sum = 0;
			while (len--) {
				sum += !(bit ^= 1) ? parseInt(val[len], 10) : array[val[len]];
			}

			if (!(sum % 10 === 0 && sum > 0)) {
				errors.push({ type: "luhn", field: "${path}", actual: value });
			}
		}
	`;
};
