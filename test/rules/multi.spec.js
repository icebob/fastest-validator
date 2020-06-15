"use strict";

const Validator = require("../../lib/validator");
const v = new Validator({
	useNewCustomCheckerFunction: true,
});

describe("Test rule: multi", () => {
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
});
