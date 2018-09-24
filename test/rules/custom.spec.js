"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/custom");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkCustom", () => {

	it("should call custom checker", () => {
		const checker = jest.fn(() => true);
		const s = { type: "custom", a: 5, check: checker };

		expect(check(10, s)).toEqual(true);
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, s, undefined);
	});

	it("should handle returned errors", () => {
		const checker = jest.fn(function() { 
			return this.makeError("myError", 3, 4);
		});
		const s = { type: "custom", a: 5, check: checker };

		expect(check(10, s)).toEqual({
			type: "myError",
			actual: 4, 
			expected: 3, 
		});
		expect(checker).toHaveBeenCalledTimes(1);
		expect(checker).toHaveBeenCalledWith(10, s, undefined);
	});

});
