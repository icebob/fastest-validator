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

	it("should pass validation when schema has only key rule", () => {
		const check = v.compile({
			$$root: true,
			type: "record",
			key: { type: "string", alpha: true }
		});

		expect(check({ John: "Doe", Jane: "Doe" })).toEqual(true);
	});

	describe("Test sanitization", () => {

		it("should return sanitized record", async () => {
			const check = v.compile({
				field: {
					type: "record",
					key: {type: "string", alpha: true, trim: true},
					value: {type: "string", alpha: true, default: "Smith", optional: true},
				}
			});

			const value = { field: { John: "Doe", " Jane  ": null } };
			expect(check(value)).toEqual(true);
			expect(value).toEqual({ field: { John: "Doe", Jane: "Smith" } });
		});
	});

	it.each([
		{ rule: { type: "any" }, value: {} },
		{ rule: { type: "array" }, value: [1, 2] },
		{ rule: { type: "boolean" }, value: true },
		{ rule: { type: "class", instanceOf: Number }, value: new Number() },
		{ rule: { type: "currency", currencySymbol: "$" }, value: "$11.11" },
		{ rule: { type: "date" }, value: new Date() },
		{ rule: { type: "email" }, value: "user@example.com" },
		{ rule: { type: "enum", values: ["John", "Jane"] }, value: "John" },
		{ rule: { type: "forbidden" }, value: undefined },
		{ rule: { type: "function" }, value: () => {} },
		{ rule: { type: "luhn" }, value: "452373989901198" },
		{ rule: { type: "mac" }, value: "01:C8:95:4B:65:FE" },
		{ rule: { type: "multi", rules: ["number", "boolean"] }, value: 4 },
		{ rule: { type: "number" }, value: 3 },
		{ rule: { type: "object" }, value: {} },
		{ rule: { type: "record" }, value: { test: "test" } },
		{ rule: { type: "string" }, value: "example" },
		{ rule: { type: "url" }, value: "https://example.com" },
		{ rule: { type: "uuid" }, value: "10ba038e-48da-487b-96e8-8d3b99b6d18a" }
	])(
		"should pass validation when schema has '$rule.type' rule as value", ({ rule, value }) => {
			const check = v.compile({
				$$root: true,
				type: "record",
				value: rule
			});

			expect(check({ John: value })).toEqual(true);
		});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "record"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

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
});
