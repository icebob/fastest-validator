"use strict";

import Validator from "../../lib/validator";
import fn from "../../lib/rules/boolean";

const v = new Validator();
const check = fn.bind(v);

describe("Test checkBoolean", () => {

	it("should check values", () => {
		const s = { type: "boolean" };
		const err = { type: "boolean" };

		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check(0, s)).toEqual(err);
		expect(check(1, s)).toEqual(err);
		expect(check("", s)).toEqual(err);
		expect(check("true", s)).toEqual(err);
		expect(check("false", s)).toEqual(err);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(err);

		expect(check(false, s)).toEqual(true);
		expect(check(true, s)).toEqual(true);
	});

	it("should convert & check values", () => {
		const s = { type: "boolean", convert: true };
		const err = { type: "boolean" };

		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check(0, s)).toEqual(true);
		expect(check(1, s)).toEqual(true);
		expect(check("", s)).toEqual(err);
		expect(check("true", s)).toEqual(true);
		expect(check("false", s)).toEqual(true);
		expect(check("on", s)).toEqual(true);
		expect(check("off", s)).toEqual(true);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(err);

		expect(check(false, s)).toEqual(true);
		expect(check(true, s)).toEqual(true);
	});

});
