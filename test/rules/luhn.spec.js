"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/luhn");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkLuhn", () => {

	it("should check type of value", () => {
		const luhn = {type: "luhn"};
		const err = {type: "luhn"};
		const errString = {type: "string"};

		expect(check(null, luhn)).toEqual(errString);
		expect(check(undefined, luhn)).toEqual(errString);
		expect(check(0, luhn)).toEqual(err);
		expect(check(1, luhn)).toEqual(err);
		expect(check("", luhn)).toEqual(err);
		expect(check("true", luhn)).toEqual(err);
		expect(check([], luhn)).toEqual(errString);
		expect(check({}, luhn)).toEqual(errString);
		expect(check(false, luhn)).toEqual(errString);
		expect(check(true, luhn)).toEqual(errString);
		expect(check("452373989911198", luhn)).toEqual(err);
		expect(check("452373989901199", luhn)).toEqual(err);
		expect(check("452373989901198", luhn)).toEqual(true);
		expect(check("4523-739-8990-1198", luhn)).toEqual(true);
	});

});
