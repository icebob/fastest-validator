"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: number", () => {

	it("should check type of value", () => {
		const check = v.compile({ $$root: true, type: "number" });
		const message = "The '' field must be a number.";

		expect(check("")).toEqual([{ type: "number", actual: "", message }]);
		expect(check("test")).toEqual([{ type: "number", actual: "test", message }]);
		expect(check("1")).toEqual([{ type: "number", actual: "1", message }]);
		expect(check([])).toEqual([{ type: "number", actual: [], message }]);
		expect(check({})).toEqual([{ type: "number", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "number", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "number", actual: true, message }]);
		expect(check(NaN)).toEqual([{ type: "number", actual: NaN, message }]);
		expect(check(Number.POSITIVE_INFINITY)).toEqual([{ type: "number", actual: Number.POSITIVE_INFINITY, message }]);
		expect(check(Number.NEGATIVE_INFINITY)).toEqual([{ type: "number", actual: Number.NEGATIVE_INFINITY, message }]);

		expect(check(0)).toEqual(true);
		expect(check(5)).toEqual(true);
		expect(check(-24)).toEqual(true);
		expect(check(5.45)).toEqual(true);
	});


	it("check min", () => {
		const check = v.compile({ $$root: true, type: "number", min: 5});
		const message = "The '' field must be greater than or equal to 5.";

		expect(check(3)).toEqual([{ type: "numberMin", expected: 5, actual: 3, message }]);
		expect(check(-20)).toEqual([{ type: "numberMin", expected: 5, actual: -20, message }]);
		expect(check(5)).toEqual(true);
		expect(check(8)).toEqual(true);

		expect(v.validate(-1, { $$root: true, type: "number", min: 0})).toEqual([{actual: -1, expected: 0, field: undefined, message: "The '' field must be greater than or equal to 0.", type: "numberMin"}]);
	});

	it("check max", () => {
		const check = v.compile({ $$root: true, type: "number", max: 5});
		const message = "The '' field must be less than or equal to 5.";

		expect(check(8)).toEqual([{ type: "numberMax", expected: 5, actual: 8, message }]);
		expect(check(12345)).toEqual([{ type: "numberMax", expected: 5, actual: 12345, message }]);
		expect(check(5)).toEqual(true);
		expect(check(0)).toEqual(true);
		expect(check(-20)).toEqual(true);
	});

	it("check equal value", () => {
		const check = v.compile({ $$root: true, type: "number", equal: 123 });
		const message = "The '' field must be equal to 123.";

		expect(check(8)).toEqual([{ type: "numberEqual", expected: 123, actual: 8, message }]);
		expect(check(122)).toEqual([{ type: "numberEqual", expected: 123, actual: 122, message }]);
		expect(check(124)).toEqual([{ type: "numberEqual", expected: 123, actual: 124, message }]);
		expect(check(123)).toEqual(true);
	});

	it("check not equal value", () => {
		const check = v.compile({ $$root: true, type: "number", notEqual: 123 });
		const message = "The '' field can't be equal to 123.";

		expect(check(8)).toEqual(true);
		expect(check(122)).toEqual(true);
		expect(check(124)).toEqual(true);
		expect(check(123)).toEqual([{ type: "numberNotEqual", expected: 123, actual: 123, message }]);
	});

	it("check integer", () => {
		const check = v.compile({ $$root: true, type: "number", integer: true });
		const message = "The '' field must be an integer.";

		expect(check(8.5)).toEqual([{ type: "numberInteger", actual: 8.5, message }]);
		expect(check(0.001)).toEqual([{ type: "numberInteger", actual: 0.001, message }]);
		expect(check(-5.5)).toEqual([{ type: "numberInteger", actual: -5.5, message }]);
		expect(check(0)).toEqual(true);
		expect(check(-20)).toEqual(true);
		expect(check(20)).toEqual(true);
	});

	it("check positive number", () => {
		const check = v.compile({ $$root: true, type: "number", positive: true });
		const message = "The '' field must be a positive number.";

		expect(check(-5.5)).toEqual([{ type: "numberPositive", actual: -5.5, message }]);
		expect(check(-45)).toEqual([{ type: "numberPositive", actual: -45, message }]);
		expect(check(0)).toEqual([{ type: "numberPositive", actual: 0, message }]);
		expect(check(0.001)).toEqual(true);
		expect(check(1)).toEqual(true);
		expect(check(45.8)).toEqual(true);
	});

	it("check negative number", () => {
		const check = v.compile({ $$root: true, type: "number", negative: true });
		const message = "The '' field must be a negative number.";

		expect(check(5.5)).toEqual([{ type: "numberNegative", actual: 5.5, message }]);
		expect(check(45)).toEqual([{ type: "numberNegative", actual: 45, message }]);
		expect(check(0)).toEqual([{ type: "numberNegative", actual: 0, message }]);
		expect(check(-0.001)).toEqual(true);
		expect(check(-1)).toEqual(true);
		expect(check(-45.8)).toEqual(true);
	});

	it("should convert & check values", () => {
		const check = v.compile({ $$root: true, type: "number", convert: true });
		const message = "The '' field must be a number.";

		expect(check({})).toEqual([{ type: "number", actual: {}, message }]);
		expect(check("25abc")).toEqual([{ type: "number", actual: "25abc", message }]);

		expect(check("")).toEqual(true);
		expect(check([])).toEqual(true);
		expect(check(false)).toEqual(true);
		expect(check(true)).toEqual(true);

		expect(check("100")).toEqual(true);
		expect(check("34.76")).toEqual(true);
		expect(check("-45")).toEqual(true);
	});

	it("should sanitize", () => {
		const check = v.compile({ age: { type: "number", convert: true } });

		let obj = { age: "" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ age: 0 });

		obj = { age: [] };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ age: 0 });

		obj = { age: false };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ age: 0 });

		obj = { age: true };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ age: 1 });

		obj = { age: "100" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ age: 100 });

		obj = { age: "34.76" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ age: 34.76 });

		obj = { age: "-45" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ age: -45 });
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "number"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

		const message = "The '' field must be a number.";

		expect(check("")).toEqual([{ type: "number", actual: "", message }]);
		expect(check("test")).toEqual([{ type: "number", actual: "test", message }]);
		expect(check("1")).toEqual([{ type: "number", actual: "1", message }]);
		expect(check([])).toEqual([{ type: "number", actual: [], message }]);
		expect(check({})).toEqual([{ type: "number", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "number", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "number", actual: true, message }]);
		expect(check(NaN)).toEqual([{ type: "number", actual: NaN, message }]);
		expect(check(Number.POSITIVE_INFINITY)).toEqual([{ type: "number", actual: Number.POSITIVE_INFINITY, message }]);
		expect(check(Number.NEGATIVE_INFINITY)).toEqual([{ type: "number", actual: Number.NEGATIVE_INFINITY, message }]);

		expect(check(0)).toEqual(true);
		expect(check(5)).toEqual(true);
		expect(check(-24)).toEqual(true);
		expect(check(5.45)).toEqual(true);
	});
});
