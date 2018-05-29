"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/email");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkEmail", () => {

	it("should check values", () => {
		const s = { type: "email" };
		const err = { type: "email" };
		const errString = { type: "string" };
		
		expect(check(null, s)).toEqual(errString);
		expect(check(undefined, s)).toEqual(errString);
		expect(check(0, s)).toEqual(errString);
		expect(check(1, s)).toEqual(errString);
		expect(check("", s)).toEqual(err);
		expect(check("true", s)).toEqual(err);
		expect(check([], s)).toEqual(errString);
		expect(check({}, s)).toEqual(errString);
		expect(check(false, s)).toEqual(errString);
		expect(check(true, s)).toEqual(errString);
	});

	it("should check values with quick pattern", () => {
		const s = { type: "email" };
		const err = { type: "email" };

		expect(check("abcdefg", s)).toEqual(err);
		expect(check("1234", s)).toEqual(err);
		expect(check("abc@gmail", s)).toEqual(err);
		expect(check("@gmail.com", s)).toEqual(err);
		
		// Invalid but we are in quick mode
		expect(check("https://john@company.net", s)).toEqual(true);

		expect(check("john.doe@company.net", s)).toEqual(true);
		expect(check("james.123.45@mail.co.uk", s)).toEqual(true);
		expect(check("admin@nasa.space", s)).toEqual(true);
	});

	it("should check values", () => {
		const s = { type: "email", mode: "precise" };
		const err = { type: "email" };

		expect(check("abcdefg", s)).toEqual(err);
		expect(check("1234", s)).toEqual(err);
		expect(check("abc@gmail", s)).toEqual(err);
		expect(check("@gmail.com", s)).toEqual(err);
		expect(check("https://john@company.net", s)).toEqual(err);

		expect(check("john.doe@company.net", s)).toEqual(true);
		expect(check("james.123.45@mail.co.uk", s)).toEqual(true);
		expect(check("admin@nasa.space", s)).toEqual(true);
	});
});