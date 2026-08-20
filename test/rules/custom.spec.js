"use strict";

const Validator = require("../../lib/validator");
const { expectNoCodeExecution } = require("../helpers/security");

describe("Test rule: custom v1", () => {
	const v = new Validator();


	it("should call custom checker", () => {
		const checker = vi.fn(() => true);
		const schema = { $$root: true, type: "custom", a: 5, check: checker };
		const check = v.compile(schema);

		expect(check(10)).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, schema, "null", null, expect.any(Object));
	});

	it("should call custom checker", () => {
		const checker = vi.fn((v) => v);
		const schema = { weight: { type: "custom", a: 5, check: checker } };
		const check = v.compile(schema);

		expect(check({ weight: 10 })).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, schema.weight, "weight", { weight: 10 }, expect.any(Object));
	});

	it("should handle returned errors", () => {
		const checker = vi.fn(function () {
			return [{ type: "myError", expected: 3, actual: 4 }];
		});
		const schema = { weight: { type: "custom", a: 5, check: checker, messages: { myError: "My error message. Expected: {expected}, actual: {actual}, field: {field}" } } };
		const check = v.compile(schema);

		expect(check({ weight: 10 })).toEqual([{
			type: "myError",
			field: "weight",
			actual: 4,
			expected: 3,
			message: "My error message. Expected: 3, actual: 4, field: weight"
		}]);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, schema.weight, "weight", { weight: 10 }, expect.any(Object));
	});

	it("should allow custom metas", async () => {
		const checker = vi.fn(() => true);
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "custom",
			a: 5,
			check: checker
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(schema).toStrictEqual(clonedSchema);


		expect(check(10)).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		//checkFunction should receive the unmodified schema
		expect(checker).toHaveBeenCalledWith(10, schema, "null", null, expect.any(Object));
	});
});


describe("Test rule: custom v2", () => {
	const v = new Validator({
		useNewCustomCheckerFunction: true,
	});

	it("should call custom checker on $$root level", () => {
		const checker = vi.fn(v => v);
		const schema = { $$root: true, type: "custom", a: 5, check: checker };
		const check = v.compile(schema);

		expect(check(10)).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, [], schema, "null", null, expect.any(Object));
	});

	it("should call custom checker", () => {
		const checker = vi.fn((v) => v);
		const schema = { weight: { type: "custom", a: 5, check: checker } };
		const check = v.compile(schema);

		expect(check({ weight: 10 })).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, [], schema.weight, "weight", { weight: 10 }, expect.any(Object));
	});

	it("should handle returned errors", () => {
		const checker = vi.fn(function (value, errors) {
			errors.push({ type: "myError", expected: 3, actual: 4 });
			return value;
		});
		const schema = { weight: { type: "custom", a: 5, check: checker, messages: { myError: "My error message. Expected: {expected}, actual: {actual}, field: {field}" } } };
		const check = v.compile(schema);

		expect(check({ weight: 10 })).toEqual([{
			type: "myError",
			field: "weight",
			actual: 4,
			expected: 3,
			message: "My error message. Expected: 3, actual: 4, field: weight"
		}]);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, expect.any(Array), schema.weight, "weight", { weight: 10 }, expect.any(Object));
	});

	it("should call custom checker on $$root level", () => {
		const checker = vi.fn(v => v);
		const schema = {
			$$root: true,
			type: "object",
			properties: {
				name: "string"
			},
			custom: checker
		};
		const check = v.compile(schema);

		expect(check({ name: "John" })).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith({ name: "John" }, [], schema, "$$root", null, expect.any(Object));
	});

	it("should allow custom metas", async () => {
		const checker = vi.fn(v => v);
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "object",
			properties: {
				name: "string"
			},
			custom: checker
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(schema).toStrictEqual(clonedSchema);

		expect(check({ name: "John" })).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		//checkFunction should receive the unmodified schema
		expect(checker).toHaveBeenCalledWith({ name: "John" }, [], schema, "$$root", null, expect.any(Object));
	});

	describe("Security: custom validator path injection", () => {
		const payloadProp = "x\",});global.__FV_INJECTED__.fired = true;//";

		function objectWithCustom(custom) {
			return {
				$$root: true,
				type: "object",
				properties: {
					[payloadProp]: { type: "string", custom }
				}
			};
		}

		it("should safely quote path in legacy custom checker", () => {
			const vLegacy = new Validator();
			const check = vLegacy.compile(objectWithCustom((value) => value));
			const res = expectNoCodeExecution(
				() => check({ [payloadProp]: "hello" }),
				"legacy custom path"
			);
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});

		it("should safely quote path in new custom checker (single function)", () => {
			const vNew = new Validator({ useNewCustomCheckerFunction: true });
			const check = vNew.compile(objectWithCustom((value) => value));
			const res = expectNoCodeExecution(
				() => check({ [payloadProp]: "hello" }),
				"new custom path (single function)"
			);
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});

		it("should safely quote path in new custom checker (function in array)", () => {
			const vNew = new Validator({ useNewCustomCheckerFunction: true });
			const check = vNew.compile(objectWithCustom([(value) => value]));
			const res = expectNoCodeExecution(
				() => check({ [payloadProp]: "hello" }),
				"new custom path (function in array)"
			);
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});

		it("should safely quote path in new custom checker (type-based)", () => {
			const vNew = new Validator({
				useNewCustomCheckerFunction: true,
				customFunctions: { identity: (value) => value }
			});
			const check = vNew.compile(objectWithCustom([{ type: "identity" }]));
			const res = expectNoCodeExecution(
				() => check({ [payloadProp]: "hello" }),
				"new custom path (type-based)"
			);
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});

		it("should pass the real, un-truncated path to custom function", () => {
			const seen = [];
			const vLegacy = new Validator();
			const check = vLegacy.compile(objectWithCustom(function (value, schema, path) {
				seen.push(path);
				return value;
			}));
			expect(check({ [payloadProp]: "hello" })).toBe(true);
			expect(seen).toEqual([payloadProp]);
		});
	});

});
