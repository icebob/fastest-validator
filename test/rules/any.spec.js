"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/any");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkAny", () => {

	it("should give back true anyway", () => {
		const s = { type: "any" };

		expect(check(null, s)).toEqual(true);
		expect(check(undefined, s)).toEqual(true);
		expect(check(0, s)).toEqual(true);
		expect(check(1, s)).toEqual(true);
		expect(check("", s)).toEqual(true);
		expect(check("true", s)).toEqual(true);
		expect(check("false", s)).toEqual(true);
		expect(check([], s)).toEqual(true);
		expect(check({}, s)).toEqual(true);
	});
});
