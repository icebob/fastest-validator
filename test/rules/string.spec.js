"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/string");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkString", () => {

	it("should check type of value", () => {
		const s = { type: "string" };
		const err = { type: "string", args: [] };

		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check(0, s)).toEqual(err);
		expect(check(1, s)).toEqual(err);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(err);
		expect(check(false, s)).toEqual(err);
		expect(check(true, s)).toEqual(err);
		
		expect(check("", s)).toEqual(true);
		expect(check("test", s)).toEqual(true);
	});

	it("check empty values", () => {
		const s = { type: "string", empty: false };
		
		expect(check("abc", s)).toEqual(true);
		expect(check("", s)).toEqual({ type: "stringEmpty", args: [] });
	});

	it("check min length", () => {
		const s = { type: "string", min: 5 };
		
		expect(check("John", s)).toEqual({ type: "stringMin", args: [5, 4] });
		expect(check("Icebob", s)).toEqual(true);
	});

	it("check max length", () => {
		const s = { type: "string", max: 5 };
		
		expect(check("John", s)).toEqual(true);
		expect(check("Icebob", s)).toEqual({ type: "stringMax", args: [5, 6] });
	});

	it("check fix length", () => {
		const s = { type: "string", length: 6 };
		
		expect(check("John", s)).toEqual({ type: "stringLength", args: [6, 4] });
		expect(check("Icebob", s)).toEqual(true);
	});

	it("check pattern", () => {
		const s = { type: "string", pattern: /^[A-Z]+$/ };
		
		expect(check("John", s)).toEqual({ type: "stringPattern", args: [/^[A-Z]+$/] });
		expect(check("JOHN", s)).toEqual(true);
	});

	it("check contains", () => {
		const s = { type: "string", contains: "bob" };
		
		expect(check("John", s)).toEqual({ type: "stringContains", args: ["bob"] });
		expect(check("Icebob", s)).toEqual(true);
	});

	it("check enum", () => {
		const s = { type: "string", enum: ["male", "female"] };
		
		expect(check("", s)).toEqual({ type: "stringEnum", args: [["male", "female"]] });
		expect(check("human", s)).toEqual({ type: "stringEnum", args: [["male", "female"]] });
		expect(check("male", s)).toEqual(true);
		expect(check("female", s)).toEqual(true);
	});

});
