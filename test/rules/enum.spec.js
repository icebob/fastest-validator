"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/enum");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkEnum", () => {

	it("check enum", () => {
		const e1 = { type: "enum", values: ["male", "female"] };
		
		expect(check("", e1)).toEqual({ type: "enumValue", expected: ["male", "female"], actual: "" });
		expect(check("human", e1)).toEqual({ type: "enumValue", expected: ["male", "female"], actual: "human" });
		expect(check("male", e1)).toEqual(true);
		expect(check("female", e1)).toEqual(true);

		const e2 = { type: "enum", values: [null, 1, 2, "done", false] };
		expect(check("male", e2)).toEqual({ type: "enumValue", expected: [null, 1, 2, "done", false], actual: "male" });
		expect(check(null, e2)).toEqual(true);
		expect(check(2, e2)).toEqual(true);
		expect(check("done", e2)).toEqual(true);
		expect(check(false, e2)).toEqual(true);
	});

}
);
