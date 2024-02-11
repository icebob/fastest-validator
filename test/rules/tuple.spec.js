"use strict";

const Validator = require("../../lib/validator");

const v = new Validator({
	useNewCustomCheckerFunction: true,
	messages: {
		evenNumber: "The '' field must be an even number!"
	}
});

const tupleCompile = (schema = {}) => () =>
	v.compile(Object.assign({ $$root: true, type: "tuple" }, schema));

describe("Test rule: tuple", () => {
	it("should check schema's 'items' field type", () => {
		const message =
			"Invalid 'tuple' schema. The 'items' field must be an array.";

		expect(tupleCompile({ items: 1 })).toThrow(message);
		expect(tupleCompile({ items: {} })).toThrow(message);
		expect(tupleCompile({ items: false })).toThrow(message);
		expect(tupleCompile({ items: true })).toThrow(message);
		expect(tupleCompile({ items: "" })).toThrow(message);
		expect(tupleCompile({ items: "test" })).toThrow(message);

		expect(tupleCompile({ items: [] })).not.toThrow(message);
	});

	it("should check schema's 'items' field length", () => {
		const message =
			"Invalid 'tuple' schema. The 'items' field must not be an empty array.";

		expect(tupleCompile({ items: [] })).toThrow(message);

		expect(tupleCompile({ items: ["string", "string"] })).not.toThrow(
			message
		);
	});

	it("should check type of value", () => {
		const check = v.compile({ $$root: true, type: "tuple" });
		const message = "The '' field must be an array.";

		expect(check(0)).toEqual([{ type: "tuple", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "tuple", actual: 1, message }]);
		expect(check({})).toEqual([{ type: "tuple", actual: {}, message }]);
		expect(check(false)).toEqual([
			{ type: "tuple", actual: false, message }
		]);
		expect(check(true)).toEqual([{ type: "tuple", actual: true, message }]);
		expect(check("")).toEqual([{ type: "tuple", actual: "", message }]);
		expect(check("test")).toEqual([
			{ type: "tuple", actual: "test", message }
		]);

		expect(check([])).toEqual(true);
	});

	it("check empty values", () => {
		const check = v.compile({ $$root: true, type: "tuple", empty: false });
		const message = "The '' field must not be an empty array.";

		expect(check([1])).toEqual(true);
		expect(check([])).toEqual([
			{ type: "tupleEmpty", actual: [], message }
		]);
	});

	it("check length (w/o defined items)", () => {
		const check = v.compile({ $$root: true, type: "tuple" });

		expect(check([1])).toEqual(true);
		expect(check([1, 2, 3])).toEqual(true);
		expect(check(["Diana", true])).toEqual(true);
	});

	it("check length (w/ defined items)", () => {
		const check = v.compile({
			$$root: true,
			type: "tuple",
			items: ["boolean", "string"]
		});
		const message = "The '' field must contain 2 items.";

		expect(check([1])).toEqual([
			{
				type: "tupleLength",
				actual: 1,
				expected: 2,
				message
			}
		]);
		expect(check([1, 2, 3])).toEqual([
			{
				type: "tupleLength",
				actual: 3,
				expected: 2,
				message
			}
		]);
		expect(check([true, "Diana"])).toEqual(true);
	});

	it("check items", () => {
		const check = v.compile({
			$$root: true,
			type: "tuple",
			items: ["string", "number"]
		});

		expect(check([1, "human"])).toEqual([
			{
				type: "string",
				message: "The '[0]' field must be a string.",
				field: "[0]",
				actual: 1
			},
			{
				type: "number",
				message: "The '[1]' field must be a number.",
				field: "[1]",
				actual: "human"
			}
		]);

		expect(check(["male", 3])).toEqual(true);
	});

	it("should call custom checker", () => {
		const customFn = jest.fn(v => v);
		const schema = { pair: { type: "tuple", custom: customFn } };
		const check = v.compile(schema);

		expect(check({ pair: [1, 2] })).toEqual(true);
		expect(customFn).toHaveBeenCalledTimes(1);
		expect(customFn).toHaveBeenCalledWith(
			[1, 2],
			[],
			schema.pair,
			"pair",
			null,
			expect.any(Object)
		);
	});

	it("should call custom checker for items", () => {
		const customFn = jest.fn(v => v);
		const customFnItems = jest.fn(v => v);
		const schema = {
			pair: {
				type: "tuple",
				custom: customFn,
				items: [
					{
						type: "string",
						custom: customFnItems
					},
					{
						type: "custom",
						custom: customFnItems
					}
				]
			}
		};
		const check = v.compile(schema);

		expect(check({ pair: ["Pizza", true] })).toEqual(true);
		expect(customFn).toHaveBeenCalledTimes(1);
		expect(customFn).toHaveBeenCalledWith(
			["Pizza", true],
			[],
			schema.pair,
			"pair",
			null,
			expect.any(Object)
		);

		expect(customFnItems).toHaveBeenCalledTimes(2);
		expect(customFnItems).toHaveBeenNthCalledWith(
			1,
			"Pizza",
			[],
			schema.pair.items[0],
			"pair[0]",
			{ pair: ["Pizza", true] },
			expect.any(Object)
		);
		expect(customFnItems).toHaveBeenNthCalledWith(
			2,
			true,
			[],
			schema.pair.items[1],
			"pair[1]",
			{ pair: ["Pizza", true] },
			expect.any(Object)
		);
	});

	describe("Test sanitization", () => {
		it("should untouch the checked obj", () => {
			let schema = {
				roles: { type: "tuple" }
			};
			let check = v.compile(schema);

			const obj = {
				roles: ["x", "y"]
			};

			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({
				roles: ["x", "y"]
			});
		});

		it("should call items custom checker function", () => {
			const customFn = (value, errors) => {
				if (value % 2 !== 0) errors.push({ type: "evenNumber" });
				return value * 2;
			};

			const check = v.compile({
				a: {
					type: "tuple",
					items: [
						{ type: "number", custom: customFn },
						{ type: "number", custom: customFn }
					]
				}
			});

			const o = {
				a: [1, 2]
			};

			const errors = check(o);

			expect(Array.isArray(errors)).toBe(true);
			expect(errors.length).toBe(1);
			expect(errors[0].type).toBe("evenNumber");
			expect(o.a).toEqual([2, 4]);
		});
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "tuple"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

		const message = "The '' field must be an array.";

		expect(check(0)).toEqual([{ type: "tuple", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "tuple", actual: 1, message }]);
		expect(check({})).toEqual([{ type: "tuple", actual: {}, message }]);
		expect(check(false)).toEqual([
			{ type: "tuple", actual: false, message }
		]);
		expect(check(true)).toEqual([{ type: "tuple", actual: true, message }]);
		expect(check("")).toEqual([{ type: "tuple", actual: "", message }]);
		expect(check("test")).toEqual([
			{ type: "tuple", actual: "test", message }
		]);

		expect(check([])).toEqual(true);
	});
});
