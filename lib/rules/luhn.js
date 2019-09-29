"use strict";

/**
 * Luhn algorithm checksum https://en.wikipedia.org/wiki/Luhn_algorithm
 * Credit Card numbers, IMEI numbers, National Provider Identifier numbers and others
 * @param value
 * @param schema
 * @return {boolean|{actual, expected, type}|ValidationError}
 */
module.exports = function checkLuhn(value, schema) {

	if(typeof value !== "number" && typeof value !== "string")
		return this.makeError("string");

	if (typeof value !== "string")
		value = String(value);

	value = value.replace(/\D+/g, "");

	const check = function (array) {
		return number => {
			let len = number ? number.length : 0,
				bit = 1,
				sum = 0;
			while (len--) {
				sum += !(bit ^= 1) ? parseInt(number[len], 10) : array[number[len]];
			}
			return sum % 10 === 0 && sum > 0;
		};
	}([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]);

	return check(value) || this.makeError("luhn");
};
