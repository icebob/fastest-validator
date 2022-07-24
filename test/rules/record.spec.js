"use strict";

const Validator = require("../../lib/validator");
const v = new Validator({ debug: false });

describe("Test rule: record", () => {

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "record" });
		const message = "The '' must be an Object.";

		expect(check(0)).toEqual([{ type: "record", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "record", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "record", actual: "", message }]);
		expect(check(false)).toEqual([{ type: "record", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "record", actual: true, message }]);
		expect(check([])).toEqual([{ type: "record", actual: [], message }]);
		expect(check({})).toEqual(true);
		expect(check({ a: "John" })).toEqual(true);
	});

	it("should return key validation error when record has invalid key", () => {
		const check = v.compile({ $$root: true, type: "record", key: { type: "string", numeric: true } });

		expect(check({ nonNumeric: 3 })).toEqual([
			{ type: "stringNumeric", actual: "nonNumeric", field: "nonNumeric", message: "The 'nonNumeric' key must be a numeric string." }
		]);
	});


	it("should return value validation error when record has invalid value", () => {
		const check = v.compile({ $$root: true, type: "record", value: { type: "number" }});

		expect(check({ John: "Doe", Jane: 33 })).toEqual([
			{ type: "number", actual: "Doe", field: "John", message: "The 'John' field must be a number." }
		]);
	});

	it("should return value and key validation errors when record has invalid value and key", () => {
		const check = v.compile({
			$$root: true,
			type: "record",
			key: { type: "string", alpha: true },
			value: { type: "string" }
		});

		expect(check({ John: "Doe", 1: 2 })).toEqual([
			{ type: "stringAlpha", actual: "1", field: "1", message: "The '1' key must be an alphabetic string." },
			{ type: "string", actual: 2, field: "1", message: "The '1' field must be a string." }
		]);
	});
});
