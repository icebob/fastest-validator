"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/number");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkNumber", () => {

	it("should check type of value", () => {
		const s = { type: "number" };
		const err = { type: "number", args: [] };

		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check("", s)).toEqual(err);
		expect(check("test", s)).toEqual(err);
		expect(check("1", s)).toEqual(err);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(err);
		expect(check(false, s)).toEqual(err);
		expect(check(true, s)).toEqual(err);
		expect(check(NaN, s)).toEqual(err);
		expect(check(Number.POSITIVE_INFINITY, s)).toEqual(err);
		expect(check(Number.NEGATIVE_INFINITY, s)).toEqual(err);
		
		expect(check(0, s)).toEqual(true);
		expect(check(5, s)).toEqual(true);
		expect(check(-24, s)).toEqual(true);
		expect(check(5.45, s)).toEqual(true);
	});

	it("should convert & check values", () => {
		const s = { type: "number", convert: true };
		const err = { type: "number", args: [] };
		
		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check("", s)).toEqual(err);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(err);
		expect(check(false, s)).toEqual(err);
		expect(check(true, s)).toEqual(err);

		expect(check("100", s)).toEqual(true);
		expect(check("34.76", s)).toEqual(true);
		expect(check("-45", s)).toEqual(true);		
	});

	it("check min", () => {
		const s = { type: "number", min: 5 };
		
		expect(check(3, s)).toEqual({ type: "numberMin", args: [5, 3] });
		expect(check(-20, s)).toEqual({ type: "numberMin", args: [5, -20] });
		expect(check(5, s)).toEqual(true);
		expect(check(8, s)).toEqual(true);
	});

	it("check max", () => {
		const s = { type: "number", max: 5 };
		
		expect(check(8, s)).toEqual({ type: "numberMax", args: [5, 8] });
		expect(check(12345, s)).toEqual({ type: "numberMax", args: [5, 12345] });
		expect(check(5, s)).toEqual(true);
		expect(check(0, s)).toEqual(true);
		expect(check(-20, s)).toEqual(true);
	});

	it("check equal value", () => {
		const s = { type: "number", equal: 123 };
		
		expect(check(8, s)).toEqual({ type: "numberEqual", args: [123, 8] });
		expect(check(123, s)).toEqual(true);
	});

	it("check not equal value", () => {
		const s = { type: "number", notEqual: 123 };
		
		expect(check(8, s)).toEqual(true);
		expect(check(123, s)).toEqual({ type: "numberNotEqual", args: [123] });
	});

	it("check integer", () => {
		const s = { type: "number", integer: true };
		
		expect(check(8.5, s)).toEqual({ type: "numberInteger", args: [8.5] });
		expect(check(0.001, s)).toEqual({ type: "numberInteger", args: [0.001] });
		expect(check(-5.5, s)).toEqual({ type: "numberInteger", args: [-5.5] });
		expect(check(0, s)).toEqual(true);
		expect(check(-20, s)).toEqual(true);
		expect(check(20, s)).toEqual(true);
	});

	it("check positive number", () => {
		const s = { type: "number", positive: true };
		
		expect(check(-5.5, s)).toEqual({ type: "numberPositive", args: [-5.5] });
		expect(check(-45, s)).toEqual({ type: "numberPositive", args: [-45] });
		expect(check(0, s)).toEqual({ type: "numberPositive", args: [0] });
		expect(check(0.001, s)).toEqual(true);
		expect(check(1, s)).toEqual(true);
		expect(check(45.8, s)).toEqual(true);
	});

	it("check negative number", () => {
		const s = { type: "number", negative: true };
		
		expect(check(5.5, s)).toEqual({ type: "numberNegative", args: [5.5] });
		expect(check(45, s)).toEqual({ type: "numberNegative", args: [45] });
		expect(check(0, s)).toEqual({ type: "numberNegative", args: [0] });
		expect(check(-0.001, s)).toEqual(true);
		expect(check(-1, s)).toEqual(true);
		expect(check(-45.8, s)).toEqual(true);
	});
});
