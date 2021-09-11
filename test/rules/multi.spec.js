"use strict";

const Validator = require("../../lib/validator");

describe("Test rule: multi", () => {
	const v = new Validator({
		useNewCustomCheckerFunction: true,
	});
	it("should call item's custom checker function", () => {
		const fn = jest.fn((v) => v);

		const schema = {
			$$root: true,
			type: "multi",
			rules: [{
				type: "string",
				custom: fn
			}, {
				type: "number",
				custom: fn
			}]
		};

		const check = v.compile(schema);

		check("s");
		expect(fn).toBeCalledTimes(1);
		expect(fn).toBeCalledWith("s", [], schema.rules[0], "$$root", null, expect.any(Object));
	});

	// it("should value equals to other field", () => {
	// 	// TODO: move from validator.spec.js
	// });

	describe("object strict test", function () {
		it("should pass simple test", () => {
			const v = new Validator({
				useNewCustomCheckerFunction: true,
			});
			const check = v.compile({
				$$root: true,
				type: "multi",
				rules: ["string", "number"]
			});
			expect(check(1)).toBe(true);
			expect(check("1")).toBe(true);
			expect(check({a: 1})).toEqual([{"actual": {"a": 1}, "field": undefined, "message": "The '' field must be a string.", "type": "string"}, {"actual": {"a": 1}, "field": undefined, "message": "The '' field must be a number.", "type": "number"}]);
		});
		it("should pass object strict remove", () => {
			const v = new Validator({
				useNewCustomCheckerFunction: true,
			});

			v.alias("targetA", {
				type: "object", strict: "remove", props: {
					a: "number"
				}
			});

			v.alias("targetB", {
				type: "object", strict: "remove", props: {
					b: "number"
				}
			});

			v.alias("targetC", {
				type: "object", props: {
					c: "number"
				}
			});

			const check = v.compile({
				$$root: true,
				type: "multi",
				rules: ["targetA", "targetB", "targetC"]
			});

			expect(check({a: 1})).toBe(true);

			const testB = {b: 2, z: 3};
			expect(check(testB)).toBe(true);
			expect(testB).toEqual({b: 2});

			const testC = {c: 3, d: 4};
			expect(check(testC)).toBe(true);
			expect(testC).toEqual({c: 3, d: 4});

			expect(check({d: 4})).toEqual([{"actual": undefined, "field": "a", "message": "The 'a' field is required.", "type": "required"}, {"actual": undefined, "field": "b", "message": "The 'b' field is required.", "type": "required"}, {"actual": undefined, "field": "c", "message": "The 'c' field is required.", "type": "required"}]);
		});
	});
});
