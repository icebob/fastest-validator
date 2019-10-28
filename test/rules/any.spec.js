"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: any", () => {

	it("should give back true anyway", () => {
		const check = v.compile({ $$root: true, type: "any" });

		expect(check(null)).toEqual(true);
		expect(check(undefined)).toEqual(true);
		expect(check(0)).toEqual(true);
		expect(check(1)).toEqual(true);
		expect(check("")).toEqual(true);
		expect(check("true")).toEqual(true);
		expect(check("false")).toEqual(true);
		expect(check([])).toEqual(true);
		expect(check({})).toEqual(true);
	});
});
