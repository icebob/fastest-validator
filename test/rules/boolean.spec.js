"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/boolean");

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

	it("should convert original values", () => {
		const s = { status: { type: "boolean", convert: true } };
		const v1 = { status: "on" };
		const v2 = { status: "off" };
		const v3 = { status: "true" };
		const v4 = { status: "false" };
		const v5 = { status: "1" };
		const v6 = { status: "0" };

		expect(v.validate(v1, s)).toEqual(true);
		expect(v1.status).toEqual(true);
		expect(v.validate(v2, s)).toEqual(true);
		expect(v2.status).toEqual(false);
		expect(v.validate(v3, s)).toEqual(true);
		expect(v3.status).toEqual(true);
		expect(v.validate(v4, s)).toEqual(true);
		expect(v4.status).toEqual(false);
		expect(v.validate(v5, s)).toEqual(true);
		expect(v5.status).toEqual(true);
		expect(v.validate(v6, s)).toEqual(true);
		expect(v6.status).toEqual(false);
	});

});
