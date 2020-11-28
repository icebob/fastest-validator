"use strict";

const Validator = require("../../lib/validator");
const v = new Validator({
	useNewCustomCheckerFunction: true,
});

describe("Test rule: switch", () => {
	it("should validate switch schemas (number)", () => {
		const schema = {
			$$root: true,
			type: "switch",
			cases: [
				{
					if: {
						type: "number",
						min: 4,
					},
					then: {
						type: "number",
						max: 10,
					},
				},
				{
					if: {
						type: "number",
						max: 4,
					},
					then: {
						type: "number",
						min: 0,
					},
				},
			],
		};

		const check = v.compile(schema);

		expect(check(4)).toEqual(true);

		expect(check(5)).toEqual(true);

		expect(check(10)).toEqual(true);

		expect(check(11)).toEqual([
			{
				actual: 11,
				expected: 10,
				field: undefined,
				message: "The '' field must be less than or equal to 10.",
				type: "numberMax",
			},
		]);

		expect(check(3)).toEqual(true);

		expect(check(0)).toEqual(true);

		expect(check(-1)).toEqual([
			{
				actual: -1,
				expected: 0,
				field: undefined,
				message: "The '' field must be greater than or equal to 0.",
				type: "numberMin",
			},
		]);
	});

	it("should validate switch schemas (custom function)", () => {
		const fnIf = jest.fn();
		const fnThen = jest.fn();
		const fnElse = jest.fn();

		const schema = {
			$$root: true,
			type: "switch",
			cases: [
				{
					if: {
						type: "number",
						custom: fnIf,
					},
					then: {
						type: "number",
						custom: fnThen,
					},
				},
			],
			else: {
				type: "number",
				custom: fnElse,
			},
		};

		const check = v.compile(schema);

		check(42);

		expect(fnIf).toBeCalledTimes(1);
		expect(fnIf).toBeCalledWith(
			42,
			[],
			schema.cases[0].if,
			"$$root",
			null,
			expect.any(Object)
		);
		expect(fnThen).toBeCalledTimes(1);
		expect(fnThen).toBeCalledWith(
			42,
			[],
			schema.cases[0].then,
			"$$root",
			null,
			expect.any(Object)
		);
		expect(fnElse).toBeCalledTimes(0);

		check("42");

		expect(fnElse).toBeCalledTimes(1);
		expect(fnElse).toBeCalledWith(
			"42",
			[],
			schema.else,
			"$$root",
			null,
			expect.any(Object)
		);
	});

	it("should validate switch schemas (number, impossible cases)", () => {
		const schema = {
			$$root: true,
			type: "switch",
			cases: [
				{
					if: {
						type: "number",
						min: 4,
					},
					then: {
						type: "number",
						max: 3,
					},
				},
				{
					if: {
						type: "number",
						max: 4,
					},
					then: {
						type: "number",
						min: 5,
					},
				},
			],
		};

		const check = v.compile(schema);

		expect(check(4)).toEqual([
			{
				actual: 4,
				expected: 3,
				field: undefined,
				message: "The '' field must be less than or equal to 3.",
				type: "numberMax",
			},
		]);

		expect(check(3)).toEqual([
			{
				actual: 3,
				expected: 5,
				field: undefined,
				message: "The '' field must be greater than or equal to 5.",
				type: "numberMin",
			},
		]);
	});

	it("should validate switch schemas (no match, without default)", () => {
		const schema = {
			$$root: true,
			type: "switch",
			cases: [
				{
					if: {
						type: "number",
						min: 8,
					},
					then: {
						type: "number",
						max: 15,
					},
				},
				{
					if: {
						type: "number",
						max: 4,
					},
					then: {
						type: "number",
						min: 0,
					},
				},
			],
		};

		const check = v.compile(schema);

		expect(check(6)).toEqual(true);
	});

	it("should validate switch schemas (no match, with else)", () => {
		const schema = {
			$$root: true,
			type: "switch",
			cases: [
				{
					if: {
						type: "number",
						min: 8,
					},
					then: {
						type: "number",
						max: 15,
					},
				},
				{
					if: {
						type: "number",
						max: 4,
					},
					then: {
						type: "number",
						min: 0,
					},
				},
			],
			else: {
				type: "equal",
				value: 6,
			},
		};

		const check = v.compile(schema);

		expect(check(6)).toEqual(true);

		expect(check(7)).toEqual([
			{
				actual: 7,
				expected: 6,
				field: undefined,
				message: "The '' field value must be equal to '6'.",
				type: "equalValue",
			},
		]);
	});

	it("should validate switch schemas (object)", () => {
		const schema = {
			$$root: true,
			type: "switch",
			cases: [
				{
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

		expect(check({ foo: "foo", bar: 42 })).toEqual([
			{
				actual: 42,
				expected: "bar",
				field: "bar",
				message: "The 'bar' field value must be equal to 'bar'.",
				type: "equalValue",
			},
		]);

		expect(check({ foo: "bar", bar: "foo" })).toEqual(true);

		expect(check({ foo: "bar", bar: 42 })).toEqual([
			{
				actual: 42,
				expected: "foo",
				field: "bar",
				message: "The 'bar' field value must be equal to 'foo'.",
				type: "equalValue",
			},
		]);
	});

	it("should validate switch schemas (object, with else)", () => {
		const schema = {
			$$root: true,
			type: "switch",
			cases: [
				{
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
				},
				{
					if: {
						type: "object",
						props: {
							type: {
								type: "equal",
								value: "some_type_b",
							},
						},
						strict: false,
					},
					then: {
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
				},
			],
			else: {
				type: "object",
				props: {
					type: {
						type: "string",
						enum: ["some_type_a", "some_type_b"],
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

		expect(
			check({ type: "some_type_c", product_id: "1234567890" })
		).toEqual([
			{
				actual: "some_type_c",
				expected: "some_type_a, some_type_b",
				field: "type",
				message:
					"The 'type' field does not match any of the allowed values.",
				type: "stringEnum",
			},
		]);
	});

	// These tests should yield the same results as the one above.
	// They are just a nested version of if / elses instead of the
	// "switch" syntax.
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
				type: "if",
				if: {
					type: "object",
					props: {
						type: {
							type: "equal",
							value: "some_type_b",
						},
					},
					strict: false,
				},
				then: {
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
				else: {
					type: "object",
					props: {
						type: {
							type: "string",
							enum: ["some_type_a", "some_type_b"],
						},
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

		expect(
			check({ type: "some_type_c", product_id: "1234567890" })
		).toEqual([
			{
				actual: "some_type_c",
				expected: "some_type_a, some_type_b",
				field: "type",
				message:
					"The 'type' field does not match any of the allowed values.",
				type: "stringEnum",
			},
		]);
	});

	it("should validate switch schemas (objects in array, with else)", () => {
		const schema = {
			$$root: true,
			type: "array",
			items: {
				type: "switch",
				cases: [
					{
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
					},
					{
						if: {
							type: "object",
							props: {
								type: {
									type: "equal",
									value: "some_type_b",
								},
							},
							strict: false,
						},
						then: {
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
					},
				],
				else: {
					type: "object",
					props: {
						type: {
							type: "string",
							enum: ["some_type_a", "some_type_b"],
						},
					},
				},
			},
		};

		const check = v.compile(schema);

		expect(
			check([
				{ type: "some_type_a", product_id: "1234567890" },
				{ type: "some_type_b", product_tag: "some_other_tag" },
			])
		).toEqual(true);

		expect(
			check([
				{ type: "some_type_a", product_id: "1234567890" },
				{ type: "some_type_b", product_tag: "some_other_tag" },
				{ type: "some_type_c", foo: "bar" },
			])
		).toEqual([
			{
				actual: "some_type_c",
				expected: "some_type_a, some_type_b",
				field: "[2].type",
				message:
					"The '[2].type' field does not match any of the allowed values.",
				type: "stringEnum",
			},
		]);
	});
});
