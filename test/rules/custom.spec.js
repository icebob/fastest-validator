"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: custom", () => {

	it("should call custom checker", () => {
		const checker = jest.fn(() => true);
		const schema = { $$root: true, type: "custom", a: 5, check: checker };
		const check = v.compile(schema);

		expect(check(10)).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, [], schema, "null", null, expect.any(Object));
	});

	it("should call custom checker", () => {
		const checker = jest.fn((v) => v);
		const schema = { weight: { type: "custom", a: 5, check: checker } };
		const check = v.compile(schema);

		expect(check({ weight: 10 })).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, [], schema.weight, "weight", { weight: 10 }, expect.any(Object));
	});

	it("should handle returned errors", () => {
		const checker = jest.fn(function (value, errors, schema, field) {
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

});
