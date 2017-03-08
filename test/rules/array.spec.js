"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/array");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkArray", () => {

	it("should check type of value", () => {
		const s = { type: "array" };
		const err = { type: "array", args: [] };

		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check(0, s)).toEqual(err);
		expect(check(1, s)).toEqual(err);
		expect(check({}, s)).toEqual(err);
		expect(check(false, s)).toEqual(err);
		expect(check(true, s)).toEqual(err);
		expect(check("", s)).toEqual(err);
		expect(check("test", s)).toEqual(err);

		expect(check([], s)).toEqual(true);
	});

	it("check empty values", () => {
		const s = { type: "array", empty: false };
		
		expect(check([1], s)).toEqual(true);
		expect(check([], s)).toEqual({ type: "arrayEmpty", args: [] });
	});

	it("check min length", () => {
		const s = { type: "array", min: 3 };
		
		expect(check([], s)).toEqual({ type: "arrayMin", args: [3, 0] });
		expect(check([5, 7], s)).toEqual({ type: "arrayMin", args: [3, 2] });
		expect(check(["a", "b", "c"], s)).toEqual(true);
		expect(check([1, 2, 3, 4, 5], s)).toEqual(true);
	});

	it("check max length", () => {
		const s = { type: "array", max: 3 };
		
		expect(check([1, 2, 3, 4], s)).toEqual({ type: "arrayMax", args: [3, 4] });
		expect(check(["a", "b", "c"], s)).toEqual(true);
		expect(check([1], s)).toEqual(true);
		expect(check([], s)).toEqual(true);
	});

	it("check fix length", () => {
		const s = { type: "array", length: 2 };
		
		expect(check([1, 2, 3, 4], s)).toEqual({ type: "arrayLength", args: [2, 4] });
		expect(check([1], s)).toEqual({ type: "arrayLength", args: [2, 1] });
		expect(check([], s)).toEqual({ type: "arrayLength", args: [2, 0] });
		expect(check(["a", "b"], s)).toEqual(true);
	});

	it("check contains", () => {
		const s = { type: "array", contains: "bob" };
		
		expect(check([], s)).toEqual({ type: "arrayContains", args: ["bob"] });
		expect(check(["john"], s)).toEqual({ type: "arrayContains", args: ["bob"] });
		expect(check(["john", "bob"], s)).toEqual(true);
	});

	it("check enum", () => {
		const s = { type: "array", enum: ["male", "female"] };
		
		//expect(check([], s)).toEqual({ type: "arrayEnum", args: [["male", "female"]] });
		expect(check(["human"], s)).toEqual({ type: "arrayEnum", args: ["human", ["male", "female"]] });
		expect(check(["male"], s)).toEqual(true);
		expect(check(["male", "female"], s)).toEqual(true);
		expect(check(["male", "female", "human"], s)).toEqual({ type: "arrayEnum", args: ["human", ["male", "female"]] });
	});

});
