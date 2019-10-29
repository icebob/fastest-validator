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
		expect(checker).toHaveBeenCalledWith(10, schema, "null", undefined, 10);
	});

	it("should call custom checker", () => {
		const checker = jest.fn(() => true);
		const schema = { weight: { type: "custom", a: 5, check: checker } };
		const check = v.compile(schema);

		expect(check({ weight: 10 })).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, schema.weight, "weight", { weight: 10 }, { weight: 10 });
	});

	it("should handle returned errors", () => {
		const checker = jest.fn(function(value, schema, field) {
			return [{ type: "myError", field, expected: 3, actual: 4 }];
		});
		const schema = { weight: { type: "custom", a: 5, check: checker } };
		const check = v.compile(schema);

		expect(check({ weight: 10 })).toEqual([{
			type: "myError",
			actual: 4,
			expected: 3,
		}]);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, schema.weight, "weight", { weight: 10 }, { weight: 10 });
	});

});
