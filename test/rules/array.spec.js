"use strict";

const Validator = require("../../lib/validator");

const v = new Validator({
	useNewCustomCheckerFunction: true,
	messages: {
		evenNumber: "The '' field must be an even number!"
	}
});
describe("Test rule: array", () => {

	it("should check type of value", () => {
		const check = v.compile({ $$root: true, type: "array" });
		const message = "The '' field must be an array.";

		expect(check(0)).toEqual([{ type: "array", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "array", actual: 1, message }]);
		expect(check({})).toEqual([{ type: "array", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "array", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "array", actual: true, message }]);
		expect(check("")).toEqual([{ type: "array", actual: "", message }]);
		expect(check("test")).toEqual([{ type: "array", actual: "test", message }]);

		expect(check([])).toEqual(true);
	});

	it("check empty values", () => {
		const check = v.compile({ $$root: true, type: "array", empty: false });

		expect(check([1])).toEqual(true);
		expect(check([])).toEqual([{ type: "arrayEmpty", actual: [], message: "The '' field must not be an empty array." }]);
	});

	it("check min length", () => {
		const check = v.compile({ $$root: true, type: "array", min: 3 });

		expect(check([])).toEqual([{ type: "arrayMin", expected: 3, actual: 0, message: "The '' field must contain at least 3 items." }]);
		expect(check([5, 7])).toEqual([{ type: "arrayMin", expected: 3, actual: 2, message: "The '' field must contain at least 3 items." }]);
		expect(check(["a", "b", "c"])).toEqual(true);
		expect(check([1, 2, 3, 4, 5])).toEqual(true);
	});

	it("check max length", () => {
		const check = v.compile({ $$root: true, type: "array", max: 3 });

		expect(check([1, 2, 3, 4])).toEqual([{ type: "arrayMax", expected: 3, actual: 4, message: "The '' field must contain less than or equal to 3 items." }]);
		expect(check(["a", "b", "c"])).toEqual(true);
		expect(check([1])).toEqual(true);
		expect(check([])).toEqual(true);
	});

	it("check fix length", () => {
		const check = v.compile({ $$root: true, type: "array", length: 2 });

		expect(check([1, 2, 3, 4])).toEqual([{ type: "arrayLength", expected: 2, actual: 4, message: "The '' field must contain 2 items." }]);
		expect(check([1])).toEqual([{ type: "arrayLength", expected: 2, actual: 1, message: "The '' field must contain 2 items." }]);
		expect(check([])).toEqual([{ type: "arrayLength", expected: 2, actual: 0, message: "The '' field must contain 2 items." }]);
		expect(check(["a", "b"])).toEqual(true);
	});

	it("check contains", () => {
		const check = v.compile({ $$root: true, type: "array", contains: "bob" });

		expect(check([])).toEqual([{ type: "arrayContains", expected: "bob", actual: [], message: "The '' field must contain the 'bob' item." }]);
		expect(check(["john"])).toEqual([{ type: "arrayContains", expected: "bob", actual: ["john"], message: "The '' field must contain the 'bob' item." }]);
		expect(check(["john", "bob"])).toEqual(true);
	});

	it("check contains with numbers", () => {
		const check = v.compile({ $$root: true, type: "array", contains: 5 });

		expect(check([])).toEqual([{ type: "arrayContains", expected: 5, actual: [], message: "The '' field must contain the '5' item." }]);
		expect(check([3, 7])).toEqual([{ type: "arrayContains", expected: 5, actual: [3, 7], message: "The '' field must contain the '5' item." }]);
		expect(check([8, 5, 2])).toEqual(true);
	});

	it("check unique", () => {
		const check = v.compile({ $$root: true, type: "array", unique: true });

		expect(check(["bob", "john", "bob"])).toEqual([{ type: "arrayUnique", expected: ["bob"], actual: ["bob", "john", "bob"], message: "The 'bob,john,bob' value in '' field does not unique the 'bob' values." }]);
		expect(check(["bob", "john", "bob", "bob", "john"])).toEqual([{ type: "arrayUnique", expected: ["bob", "john"], actual: ["bob", "john", "bob", "bob", "john"], message: "The 'bob,john,bob,bob,john' value in '' field does not unique the 'bob,john' values." }]);
		expect(check([1, 2, 1, false, true, false])).toEqual([{ type: "arrayUnique", expected: [1, false], actual: [1, 2, 1, false, true, false], message: "The '1,2,1,false,true,false' value in '' field does not unique the '1,false' values." }]);
		expect(check([{ name: "bob" }, { name: "john" }, { name: "bob" }])).toEqual(true);
		expect(check(["john", "bob"])).toEqual(true);
	});

	it("check enum", () => {
		const check = v.compile({ $$root: true, type: "array", enum: ["male", "female"] });

		expect(check(["human"])).toEqual([{ type: "arrayEnum", actual: "human", expected: "male, female", message: "The 'human' value in '' field does not match any of the 'male, female' values." }]);
		expect(check(["male"])).toEqual(true);
		expect(check(["male", "female"])).toEqual(true);
		expect(check(["male", "female", "human"])).toEqual([{ type: "arrayEnum", actual: "human", expected: "male, female", message: "The 'human' value in '' field does not match any of the 'male, female' values." }]);
	});

	it("check items", () => {
		const check = v.compile({ $$root: true, type: "array", items: "string" });

		expect(check([])).toEqual(true);
		expect(check(["human"])).toEqual(true);
		expect(check(["male", 3, "female", true])).toEqual([
			{ type: "string", field: "[1]", actual: 3, message: "The '[1]' field must be a string." },
			{ type: "string", field: "[3]", actual: true, message: "The '[3]' field must be a string." }
		]);
	});

	it("should call custom checker", () => {
		const customFn = jest.fn(v => v);
		const schema = { numbers: { type: "array", min: 1, custom: customFn, items: "number" } };
		const check = v.compile(schema);

		expect(check({ numbers: [1,2] })).toEqual(true);
		expect(customFn).toHaveBeenCalledTimes(1);
		expect(customFn).toHaveBeenCalledWith([1,2], [], schema.numbers, "numbers", null, expect.any(Object));
	});

	it("should call custom checker for items", () => {
		const customFn = jest.fn(v => v);
		const customFnItems = jest.fn(v => v);
		const schema = { numbers: { type: "array", min: 1, custom: customFn, items: {
			type: "number", custom: customFnItems
		} } };
		const check = v.compile(schema);

		expect(check({ numbers: [1,2] })).toEqual(true);
		expect(customFn).toHaveBeenCalledTimes(1);
		expect(customFn).toHaveBeenCalledWith([1,2], [], schema.numbers, "numbers", null, expect.any(Object));

		expect(customFnItems).toHaveBeenCalledTimes(2);
		expect(customFnItems).toHaveBeenNthCalledWith(1, 1, [], schema.numbers.items, "numbers[]", { numbers: [1,2] }, expect.any(Object));
		expect(customFnItems).toHaveBeenNthCalledWith(2, 2, [], schema.numbers.items, "numbers[]", { numbers: [1,2] }, expect.any(Object));
	});

	describe("Test sanitization", () => {

		it("should untouch the checked obj", () => {
			let schema = {
				roles: { type: "array" }
			};
			let check = v.compile(schema);

			const obj = {
				roles: ["admin", "user", "moderator"]
			};

			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({
				roles: ["admin", "user", "moderator"]
			});
		});

		it("should trim all items", () => {
			let schema = {
				roles: { type: "array", items: "string|trim" }
			};
			let check = v.compile(schema);

			const obj = {
				roles: ["  admin", "user   ", "  moderator  "]
			};

			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({
				roles: ["admin", "user", "moderator"]
			});
		});

		it("should call items custom checker function", () => {
			const check = v.compile({
				a: {
					type: "array",
					items: {
						type: "number",
						custom(value, errors) {
							if (value % 2 !== 0) errors.push({ type: "evenNumber" });
							return value * 2;
						}
					}
				}
			});

			const o = {
				a: [1, 2, 4]
			};

			const errors = check(o);

			expect(Array.isArray(errors)).toBe(true);
			expect(errors.length).toBe(1);
			expect(errors[0].type).toBe("evenNumber");
			expect(o.a).toEqual([2, 4, 8]);
		});

		describe("conversion behavior", () => {
			// !! Don't use a $$root schema because the value to check will not be passed as reference but as value
			const check = v.compile({ data: { type: "array", items: "string", convert: true } });
			// Single value check
			it ("should wrap single value into array", () => {
				const value = { data: "John" };
				expect(check(value)).toEqual(true);
				expect(value.data).toEqual(["John"]);
			});
			// Already array, one element
			it ("should not change array with one element", () => {
				const value = { data: ["John"] };
				expect(check(value)).toEqual(true);
				expect(value.data).toEqual(["John"]);
			});
			// Already array, multiple elements
			it ("should not change array with multiple elements", () => {
				const value = { data: ["John", "Jane"] };
				expect(check(value)).toEqual(true);
				expect(value.data).toEqual(["John", "Jane"]);
			});
			// Empty array
			it ("should not change empty array", () => {
				const value = { data: [] };
				expect(check(value)).toEqual(true);
				expect(value.data).toEqual([]);
			});
			// Null/undefined
			it ("should not convert into array if null or undefined", () => {
				// Null check
				const value = { data: null };
				expect(check(value)).toEqual([{ type: "required", field: "data", actual: null, message: "The 'data' field is required." }]);
				expect(value.data).toEqual(null);
				// Undefined check
				const value2 = { data: undefined };
				expect(check(value2)).toEqual([{ type: "required", field: "data", actual: undefined, message: "The 'data' field is required." }]);
				expect(value2.data).toEqual(undefined);
			});

			it ("should not convert into array if undefined (new case)", () => {
				const v = new Validator({
					useNewCustomCheckerFunction: true,
					considerNullAsAValue: true,
					messages: {
						evenNumber: "The '' field must be an even number!"
					}
				});
				const check = v.compile({ data: { type: "array", items: "string", convert: true } });
				// Null check
				const value = { data: null };
				expect(check(value)).toEqual(true);
				expect(value.data).toEqual(null);
				// Undefined check
				const value2 = { data: undefined };
				expect(check(value2)).toEqual([{ type: "required", field: "data", actual: undefined, message: "The 'data' field is required." }]);
				expect(value2.data).toEqual(undefined);
			});
		});
	});

	it("should allow custom metas", async () => {
		const itemSchema = {
			$$foo: {
				foo: "bar"
			},
			type: "string",
		};
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "array",
			items: itemSchema
		};
		const clonedSchema = {...schema};
		const clonedItemSchema = {...itemSchema};
		const check = v.compile(schema);

		expect(schema).toStrictEqual(clonedSchema);
		expect(itemSchema).toStrictEqual(clonedItemSchema);

		expect(check([])).toEqual(true);
		expect(check(["human"])).toEqual(true);
		expect(check(["male", 3, "female", true])).toEqual([
			{ type: "string", field: "[1]", actual: 3, message: "The '[1]' field must be a string." },
			{ type: "string", field: "[3]", actual: true, message: "The '[3]' field must be a string." }
		]);
	});
});
