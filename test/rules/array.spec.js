"use strict";

import Validator from "../../lib/validator";
import fn from "../../lib/rules/array";

const v = new Validator();
const check = fn.bind(v);

describe("Test checkArray", () => {

	it("should check type of value", () => {
		const s = { type: "array" };
		const err = { type: "array" };

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
		expect(check([], s)).toEqual({ type: "arrayEmpty" });
	});

	it("check min length", () => {
		const s = { type: "array", min: 3 };

		expect(check([], s)).toEqual({ type: "arrayMin", expected: 3, actual: 0 });
		expect(check([5, 7], s)).toEqual({ type: "arrayMin", expected: 3, actual: 2 });
		expect(check(["a", "b", "c"], s)).toEqual(true);
		expect(check([1, 2, 3, 4, 5], s)).toEqual(true);
	});

	it("check max length", () => {
		const s = { type: "array", max: 3 };

		expect(check([1, 2, 3, 4], s)).toEqual({ type: "arrayMax", expected: 3, actual: 4 });
		expect(check(["a", "b", "c"], s)).toEqual(true);
		expect(check([1], s)).toEqual(true);
		expect(check([], s)).toEqual(true);
	});

	it("check fix length", () => {
		const s = { type: "array", length: 2 };

		expect(check([1, 2, 3, 4], s)).toEqual({ type: "arrayLength", expected: 2, actual: 4 });
		expect(check([1], s)).toEqual({ type: "arrayLength", expected: 2, actual: 1 });
		expect(check([], s)).toEqual({ type: "arrayLength", expected: 2, actual: 0 });
		expect(check(["a", "b"], s)).toEqual(true);
	});

	it("check contains", () => {
		const s = { type: "array", contains: "bob" };

		expect(check([], s)).toEqual({ type: "arrayContains", expected: "bob" });
		expect(check(["john"], s)).toEqual({ type: "arrayContains", expected: "bob" });
		expect(check(["john", "bob"], s)).toEqual(true);
	});

	it("check enum", () => {
		const s = { type: "array", enum: ["male", "female"] };

		//expect(check([], s)).toEqual({ type: "arrayEnum", expected: ["male", "female"]] });
		expect(check(["human"], s)).toEqual({ type: "arrayEnum", expected: "human", actual: ["male", "female"] });
		expect(check(["male"], s)).toEqual(true);
		expect(check(["male", "female"], s)).toEqual(true);
		expect(check(["male", "female", "human"], s)).toEqual({ type: "arrayEnum", expected: "human", actual: ["male", "female"] });
	});

});
