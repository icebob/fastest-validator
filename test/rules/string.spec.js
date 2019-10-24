"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/string");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkString", () => {

	it("should check type of value", () => {
		const s = { type: "string" };
		const err = { type: "string" };

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
		expect(check("", s)).toEqual({ type: "stringEmpty" });
	});

	it("check min length", () => {
		const s = { type: "string", min: 5 };
		
		expect(check("John", s)).toEqual({ type: "stringMin", expected: 5, actual: 4 });
		expect(check("Icebob", s)).toEqual(true);
	});

	it("check max length", () => {
		const s = { type: "string", max: 5 };
		
		expect(check("John", s)).toEqual(true);
		expect(check("Icebob", s)).toEqual({ type: "stringMax", expected: 5, actual: 6 });
	});

	it("check fix length", () => {
		const s = { type: "string", length: 6 };
		
		expect(check("John", s)).toEqual({ type: "stringLength", expected: 6, actual: 4 });
		expect(check("Icebob", s)).toEqual(true);
	});

	it("check pattern", () => {
		const s = { type: "string", pattern: /^[A-Z]+$/ };
		
		expect(check("John", s)).toEqual({ type: "stringPattern", expected: /^[A-Z]+$/ });
		expect(check("JOHN", s)).toEqual(true);
	});

	it("check pattern with string", () => {
		const s = { type: "string", pattern: "^[A-Z]+$", patternFlags: "g" };
		
		expect(check("John", s)).toEqual({ type: "stringPattern", expected: /^[A-Z]+$/g });
		expect(check("JOHN", s)).toEqual(true);
	});

	it("check contains", () => {
		const s = { type: "string", contains: "bob" };
		
		expect(check("John", s)).toEqual({ type: "stringContains", expected: "bob" });
		expect(check("Icebob", s)).toEqual(true);
	});

	it("check enum", () => {
		const s = { type: "string", enum: ["male", "female"] };
		
		expect(check("", s)).toEqual({ type: "stringEnum", expected: ["male", "female"], actual: "" });
		expect(check("human", s)).toEqual({ type: "stringEnum", expected: ["male", "female"], actual: "human" });
		expect(check("male", s)).toEqual(true);
		expect(check("female", s)).toEqual(true);
	});

	it("check numeric string", () => {
		const s = {type: "string", numeric: true};

		expect(check("123.1s0", s)).toEqual({type: "stringNumeric", expected: "A numeric string", actual: "123.1s0"});
		expect(check("x", s)).toEqual({type: "stringNumeric", expected: "A numeric string", actual: "x"});
		expect(check("", s)).toEqual({type: "stringNumeric", expected: "A numeric string", actual: ""});
		expect(check(" ", s)).toEqual({type: "stringNumeric", expected: "A numeric string", actual: " "});

		expect(check("123", s)).toEqual(true);
		expect(check("-123", s)).toEqual(true);
		expect(check("123.10", s)).toEqual(true);
		expect(check("-123.10", s)).toEqual(true);
	});

	it("check alphabetic string", () => {
		const s = {type: "string", alpha: true};

		expect(check("3312", s)).toEqual({type: "stringAlpha", expected: "An alphabetic string", actual: "3312"});
		expect(check("h3ll0", s)).toEqual({type: "stringAlpha", expected: "An alphabetic string", actual: "h3ll0"});
		expect(check("us3rnam3", s)).toEqual({type: "stringAlpha", expected: "An alphabetic string", actual: "us3rnam3"});

		expect(check("username", s)).toEqual(true);
		expect(check("hello", s)).toEqual(true);
		expect(check("elliot", s)).toEqual(true);

	});

	it("check alphanumeric string", () => {
		const s = {type: "string", alphanum: true};

		expect(check("hello_world", s)).toEqual({type: "stringAlphanum", expected: "An alphanumeric string", actual: "hello_world"});
		expect(check("print()", s)).toEqual({type: "stringAlphanum", expected: "An alphanumeric string", actual: "print()"});
		expect(check("user.name", s)).toEqual({type: "stringAlphanum", expected: "An alphanumeric string", actual: "user.name"});

		expect(check("p4ssword", s)).toEqual(true);
		expect(check("anarchy77", s)).toEqual(true);
	});

	it("check alphadash string", () => {
		const s = {type: "string", alphadash: true};

		expect(check("hello world", s)).toEqual({type: "stringAlphadash", expected: "An alphadash string", actual: "hello world"});
		expect(check("hello.world", s)).toEqual({type: "stringAlphadash", expected: "An alphadash string", actual: "hello.world"});
		expect(check("spaced string", s)).toEqual({type: "stringAlphadash", expected: "An alphadash string", actual: "spaced string"});


		expect(check("hello_world", s)).toEqual(true);
		expect(check("dashed_string", s)).toEqual(true);

	});


});
