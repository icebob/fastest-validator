"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/forbidden");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkForbidden", () => {

	it("should check values", () => {
		const s = { type: "forbidden" };
		const err = { type: "forbidden", args: [] };
		
		expect(check(null, s)).toEqual(true);
		expect(check(undefined, s)).toEqual(true);
		expect(check(0, s)).toEqual(err);
		expect(check(1, s)).toEqual(err);
		expect(check("", s)).toEqual(err);
		expect(check("true", s)).toEqual(err);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(err);
		expect(check(false, s)).toEqual(err);
		expect(check(true, s)).toEqual(err);
	});
});
