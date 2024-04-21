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

		it("issue #297", () => {
			const v = new Validator();
			const check = v.compile({
				$$strict: true,
				age: "number",
				name: "string",
				surname: "string",
			});

			expect(check({ address: "London", age: "22", name: "John", surname: "Doe" })).toEqual([{"type":"number","message":"The 'age' field must be a number.","field":"age","actual":"22"},{"type":"objectStrict","message":"The object '' contains forbidden keys: 'address'.","expected":"age, name, surname","actual":"address"}] );
		});

		it("issue #303 (nullable with shorthard format)", () => {
			const v = new Validator();
			const check = v.compile({
				dateString: [
					{ type: "string", nullable: true },
					{ type: "boolean", nullable: true }
				]
			});

			expect(check({ dateString: true })).toBe(true);
			expect(check({ dateString: new Date().toISOString() })).toBe(true);
			expect(check({ dateString: null })).toBe(true);
			expect(check({})).toEqual([{"type":"required","message":"The 'dateString' field is required.","field":"dateString","actual":undefined}] );
		});
	});

	describe("should work with custom validator", () => {
		const checkerFn = jest.fn(() => {});

		const v = new Validator({
			useNewCustomCheckerFunction: true,
			aliases: {
				strOK: {
					type: "string",
					custom: (value, errors) => {
						checkerFn();
						if (value !== "OK") {
							errors.push({type: "strOK"});
							return;
						}
						return value;
					}
				},
				num99: {
					type: "number",
					custom: (value, errors) => {
						checkerFn();
						if (value !== 99) {
							errors.push({type: "num99"});
							return;
						}
						return value;
					}
				}
			}
		});

		const schema = {
			a: {
				type: "multi",
				rules: ["strOK", "num99"]
			}
		};
		const check = v.compile(schema);

		it("test strOK", () => {
			{
				const o = { a: "OK" };
				expect(check(o)).toBe(true);
				expect(o).toStrictEqual({ a: "OK" });
				expect(checkerFn).toBeCalledTimes(1);
			}
			{
				const o = { a: "not-OK" };
				expect(check(o)).toStrictEqual([{"field": "a", "message": undefined, "type": "strOK"}, {"actual": "not-OK", "field": "a", "message": "The 'a' field must be a number.", "type": "number"}, {"field": "a", "message": undefined, "type": "num99"}]);
				expect(o).toStrictEqual({ a: "not-OK" });
				expect(checkerFn).toBeCalledTimes(3);
			}
		});

		it("test num99", () => {
			{
				const o = { a: 99 };
				expect(check(o)).toBe(true);
				expect(o).toStrictEqual({ a: 99 });
				expect(checkerFn).toBeCalledTimes(5);
			}
			{
				const o = { a: 1199 };
				expect(check(o)).toStrictEqual([{"actual": 1199, "field": "a", "message": "The 'a' field must be a string.", "type": "string"}, {"field": "a", "message": undefined, "type": "strOK"}, {"field": "a", "message": undefined, "type": "num99"}]);
				expect(o).toStrictEqual({ a: 1199 });
				expect(checkerFn).toBeCalledTimes(7);
			}
		});
	});


	it("should allow custom metas", async () => {
		const fn = jest.fn((v) => v);
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "multi",
			rules: [
				{
					type: "string",
					custom: fn
				},
				{
					type: "number",
					custom: fn
				}
			]
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

		check("s");
		expect(fn).toBeCalledTimes(1);
		expect(fn).toBeCalledWith("s", [], schema.rules[0], "$$root", null, expect.any(Object));
	});
});
