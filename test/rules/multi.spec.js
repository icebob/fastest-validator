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

			const check = v.compile({
				$$root: true,
				type: "multi",
				rules: ["targetA", "targetB"]
			});
			const oo = {b: 2, c: 3};
			expect(check({a: 1})).toBe(true);
			expect(check(oo)).toBe(true);
			expect(oo).toEqual({b: 2});
		});
	});
});
