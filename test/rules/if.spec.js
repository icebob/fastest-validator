"use strict";

const Validator = require("../../lib/validator");
const v = new Validator({
	useNewCustomCheckerFunction: true,
});

describe("Test rule: if", () => {
	it("should validate if / else schemas (numbers / string)", () => {
		const schema = {
			$$root: true,
			type: "if",
			if: {
				type: "string",
			},
			then: {
				type: "string",
				min: 4,
			},
			else: {
				type: "equal",
				value: 42,
			},
		};

		const check = v.compile(schema);

		expect(check("42")).toEqual([
			{
				actual: 2,
				expected: 4,
				field: undefined,
				message:
					"The '' field length must be greater than or equal to 4 characters long.",
				type: "stringMin",
			},
		]);
		expect(check("4242")).toEqual(true);
		expect(check(42)).toEqual(true);
	});

	it("should validate if / else schemas (custom function)", () => {
		const fnThen = jest.fn();
		const fnElse = jest.fn();

		const schema = {
			$$root: true,
			type: "if",
			if: {
				type: "string",
			},
			then: {
				type: "string",
				custom: fnThen,
			},
			else: {
				type: "equal",
				custom: fnElse,
			},
		};

		const check = v.compile(schema);

		check("42");

		expect(fnThen).toBeCalledTimes(1);
		expect(fnThen).toBeCalledWith(
			"42",
			[],
			schema.then,
			"$$root",
			null,
			expect.any(Object)
		);
		expect(fnElse).toBeCalledTimes(0);

		check(42);

		expect(fnElse).toBeCalledTimes(1);
		expect(fnElse).toBeCalledWith(
			42,
			[],
			schema.else,
			"$$root",
			null,
			expect.any(Object)
		);
	});

	it("should validate if schema without else (numbers / string)", () => {
		const schema = {
			$$root: true,
			type: "if",
			if: {
				type: "string",
			},
			then: {
				type: "string",
				min: 4,
			},
		};

		const check = v.compile(schema);

		expect(check("42")).toEqual([
			{
				actual: 2,
				expected: 4,
				field: undefined,
				message:
					"The '' field length must be greater than or equal to 4 characters long.",
				type: "stringMin",
			},
		]);
		expect(check(42)).toEqual(true);
		expect(check(true)).toEqual(true);
	});

	it("should validate if / else schemas (object / array)", () => {
		const schema = {
			$$root: true,
			type: "if",
			if: {
				type: "object",
				props: {
					type: {
						type: "equal",
						value: "some_type_a",
					},
				},
				strict: false,
			},
			then: {
				type: "object",
				props: {
					type: {
						type: "equal",
						value: "some_type_a",
					},
					product_id: {
						type: "string",
						length: 10,
					},
				},
			},
			else: {
				type: "object",
				props: {
					type: {
						type: "equal",
						value: "some_type_b",
					},
					product_tag: {
						type: "string",
						enum: ["some_tag", "some_other_tag"],
					},
				},
			},
		};

		const check = v.compile(schema);

		expect(
			check({ type: "some_type_a", product_id: "1234567890" })
		).toEqual(true);

		expect(check({ type: "some_type_a", product_id: 1234567890 })).toEqual([
			{
				actual: 1234567890,
				field: "product_id",
				message: "The 'product_id' field must be a string.",
				type: "string",
			},
		]);

		expect(check({ type: "some_type_a", foo: "bar" })).toEqual([
			{
				actual: undefined,
				field: "product_id",
				message: "The 'product_id' field is required.",
				type: "required",
			},
		]);

		expect(
			check({ type: "some_type_b", product_tag: "some_other_tag" })
		).toEqual(true);

		expect(
			check({ type: "some_type_b", product_id: "1234567890" })
		).toEqual([
			{
				actual: undefined,
				field: "product_tag",
				message: "The 'product_tag' field is required.",
				type: "required",
			},
		]);
	});

	it("should validate if / else schemas (within multi)", () => {
		const schema = {
			$$root: true,
			type: "multi",
			rules: [
				{
					type: "if",
					if: {
						type: "object",
						props: {
							foo: { type: "equal", value: "foo" },
						},
						strict: false,
					},
					then: {
						type: "object",
						props: {
							foo: { type: "equal", value: "foo" },
							bar: { type: "equal", value: "bar" },
						},
					},
				},
				{
					type: "if",
					if: {
						type: "object",
						props: {
							foo: { type: "equal", value: "bar" },
						},
						strict: false,
					},
					then: {
						type: "object",
						props: {
							foo: { type: "equal", value: "bar" },
							bar: { type: "equal", value: "foo" },
						},
					},
				},
			],
		};

		const check = v.compile(schema);

		expect(check({ foo: "foo", bar: "bar" })).toEqual(true);

		// Why this works:
		//  - since foo === 'foo', but 4 !== 'bar', the first rule of the multi fails
		//  - since foo !== 'bar', the second rule goes to the else,
		//  - since the else does not exist, then the result is true
		expect(check({ foo: "foo", bar: 4 })).toEqual(true);

		expect(check({ foo: "bar", bar: "foo" })).toEqual(true);

		// Why this works:
		//  - since foo === 'bar', the first rule of the multi goes to the else
		//  - since the else does not exist, then the result is true
		// Moral of the story: you probably don't want to use multi with ifs,
		// use switches instead.
		expect(check({ foo: "bar", bar: 4 })).toEqual(true);
	});
});
