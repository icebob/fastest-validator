"use strict";

const Validator = require("../../lib/validator");
const v = new Validator({
	useNewCustomCheckerFunction: true
});

describe("Test rule: multi", () => {
	it("should call item's custom checker function", () => {
		const fn = jest.fn((v) => v);

		const check = v.compile({
			$$root: true,
			type: "multi", 
			rules: [{
				type: "string",
				custom: fn
			}, {
				type: "number",
				custom: fn
			}]
		});

		check("s");
		expect(fn).toBeCalledTimes(1);

	});

	it("should value equals to other field", () => {
		// TODO: move from validator.spec.js
	});
});
