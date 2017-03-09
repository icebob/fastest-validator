"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/object");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkObject", () => {

	it("should check values", () => {
		const s = { type: "object" };
		const err = { type: "object" };
		
		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check(0, s)).toEqual(err);
		expect(check(1, s)).toEqual(err);
		expect(check("", s)).toEqual(err);
		expect(check(false, s)).toEqual(err);
		expect(check(true, s)).toEqual(err);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(true);
	});
});
