"use strict";

const Validator = require("../../lib/validator");
const anyRule = require("../../lib/rules/any");

describe("Test rule: any", () => {

	it("should have source code", () => {
		expect(anyRule().source).toBeTruthy();
	});

	describe("old case (without considerNullAsAValue flag)", () => {
		const v = new Validator();

		it("should give back true anyway", () => {
			const check = v.compile({ $$root: true, type: "any" });

			expect(check(null)).toEqual([{ type: "required", actual: null, message: "The '' field is required." }]);
			expect(check(undefined)).toEqual([{ type: "required", actual: undefined, message: "The '' field is required." }]);
			expect(check(0)).toEqual(true);
			expect(check(1)).toEqual(true);
			expect(check("")).toEqual(true);
			expect(check("true")).toEqual(true);
			expect(check("false")).toEqual(true);
			expect(check([])).toEqual(true);
			expect(check({})).toEqual(true);
		});

		it("should give back true anyway as optional", () => {
			const check = v.compile({ $$root: true, type: "any", optional: true });

			expect(check(null)).toEqual(true);
			expect(check(undefined)).toEqual(true);
			expect(check(0)).toEqual(true);
			expect(check(1)).toEqual(true);
			expect(check("")).toEqual(true);
			expect(check("true")).toEqual(true);
			expect(check("false")).toEqual(true);
			expect(check([])).toEqual(true);
			expect(check({})).toEqual(true);
		});

		it("should allow custom metas", async () => {
			const schema = {
				$$foo: {
					foo: "bar"
				},
				$$root: true,
				type: "any",
				optional: true
			};
			const clonedSchema = {...schema};
			const check = v.compile(schema);

			expect(schema).toStrictEqual(clonedSchema);

			expect(check(null)).toEqual(true);
			expect(check(undefined)).toEqual(true);
			expect(check(0)).toEqual(true);
			expect(check(1)).toEqual(true);
			expect(check("")).toEqual(true);
			expect(check("true")).toEqual(true);
			expect(check("false")).toEqual(true);
			expect(check([])).toEqual(true);
			expect(check({})).toEqual(true);
		});
	});

	describe("new case (with considerNullAsAValue flag set to true)", () => {
		const v = new Validator({considerNullAsAValue: true});

		it("should give back true anyway", () => {
			const check = v.compile({ $$root: true, type: "any" });

			expect(check(null)).toEqual(true);
			expect(check(undefined)).toEqual([{ type: "required", actual: undefined, message: "The '' field is required." }]);
			expect(check(0)).toEqual(true);
			expect(check(1)).toEqual(true);
			expect(check("")).toEqual(true);
			expect(check("true")).toEqual(true);
			expect(check("false")).toEqual(true);
			expect(check([])).toEqual(true);
			expect(check({})).toEqual(true);
		});

		it("should give back true anyway as optional", () => {
			const check = v.compile({ $$root: true, type: "any", optional: true });

			expect(check(null)).toEqual(true);
			expect(check(undefined)).toEqual(true);
			expect(check(0)).toEqual(true);
			expect(check(1)).toEqual(true);
			expect(check("")).toEqual(true);
			expect(check("true")).toEqual(true);
			expect(check("false")).toEqual(true);
			expect(check([])).toEqual(true);
			expect(check({})).toEqual(true);
		});

		it("should allow custom metas", async () => {
			const schema = {
				$$foo: {
					foo: "bar"
				},
				$$root: true,
				type: "any",
				optional: true
			};
			const clonedSchema = {...schema};
			const check = v.compile(schema);

			expect(schema).toStrictEqual(clonedSchema);

			expect(check(null)).toEqual(true);
			expect(check(undefined)).toEqual(true);
			expect(check(0)).toEqual(true);
			expect(check(1)).toEqual(true);
			expect(check("")).toEqual(true);
			expect(check("true")).toEqual(true);
			expect(check("false")).toEqual(true);
			expect(check([])).toEqual(true);
			expect(check({})).toEqual(true);
		});
	});
});
describe("Security tests for any rule", function () {
	it("should compile without throwing when schema options are malicious strings", function () {
		const v = new Validator();
		const schema = {
			$$root: true,
			type: "any",
			optional: true,
			fakeStringOption: "\"); alert(1); //",
			anotherFakeOption: "'; process.exit(1); //"
		};
		const checkFn = v.compile(schema);
		expect(checkFn(null)).toEqual(true);
		expect(checkFn(undefined)).toEqual(true);
		expect(checkFn(0)).toEqual(true);
		expect(checkFn("")).toEqual(true);
		expect(checkFn({})).toEqual(true);
		expect(checkFn([])).toEqual(true);
	});

	it("should safely handle schema options that are objects or arrays", function () {
		const v = new Validator();
		const schema = {
			$$root: true,
			type: "any",
			fakeObjectOption: { toString: () => { throw new Error("should not be called"); } },
			fakeArrayOption: [() => { throw new Error("should not be called"); }]
		};
		const checkFn = v.compile(schema);
		expect(checkFn("test")).toEqual(true);
	});

	it("should not execute injected code via schema options", function () {
		const v = new Validator();
		let executed = false;
		const schema = {
			$$root: true,
			type: "any",
			fakeOption: {
				toString: () => { executed = true; return ""; }
			}
		};
		const checkFn = v.compile(schema);
		checkFn("anything");
		expect(executed).toEqual(false);
	});

	it("should work with considerNullAsAValue flag and malicious schema options", function () {
		const v = new Validator({ considerNullAsAValue: true });
		const schema = {
			$$root: true,
			type: "any",
			optional: true,
			someOption: "\"); alert(1); //"
		};
		const checkFn = v.compile(schema);
		expect(checkFn(null)).toEqual(true);
		expect(checkFn(undefined)).toEqual(true);
	});

	it("should allow valid schemas and produce correct validation", function () {
		const v = new Validator();
		const schema = {
			$$root: true,
			type: "any",
			optional: true
		};
		const checkFn = v.compile(schema);
		expect(checkFn(null)).toEqual(true);
		expect(checkFn(undefined)).toEqual(true);
		expect(checkFn(0)).toEqual(true);
		expect(checkFn(1)).toEqual(true);
		expect(checkFn("")).toEqual(true);
		expect(checkFn("false")).toEqual(true);
		expect(checkFn([])).toEqual(true);
		expect(checkFn({})).toEqual(true);
	});
});