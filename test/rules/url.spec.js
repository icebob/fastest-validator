"use strict";

import Validator from "../../lib/validator";
import fn from "../../lib/rules/url";

const v = new Validator();
const check = fn.bind(v);

describe("Test checkUrl", () => {

	it("should check values", () => {
		const s = { type: "url" };
		const err = { type: "url" };
		const errString = { type: "string" };

		expect(check(null, s)).toEqual(errString);
		expect(check(undefined, s)).toEqual(errString);
		expect(check(0, s)).toEqual(errString);
		expect(check(1, s)).toEqual(errString);
		expect(check("", s)).toEqual(err);
		expect(check("true", s)).toEqual(err);
		expect(check([], s)).toEqual(errString);
		expect(check({}, s)).toEqual(errString);
		expect(check(false, s)).toEqual(errString);
		expect(check(true, s)).toEqual(errString);

		expect(check("abcdefg", s)).toEqual(err);
		expect(check("1234.c", s)).toEqual(err);
		expect(check("gmail.company1234", s)).toEqual(err);
		expect(check("@gmail.com", s)).toEqual(err);
		expect(check("https://", s)).toEqual(err);

		expect(check("http://www.google.com", s)).toEqual(true);
		expect(check("https://google.com", s)).toEqual(true);
		expect(check("http://nasa.gov", s)).toEqual(true);
		expect(check("https://github.com", s)).toEqual(true);
		expect(check("http://github.com/icebob/fastest-validator", s)).toEqual(true);
		expect(check("http://clipboard.space", s)).toEqual(true);
		expect(check("https://localhost:3000/?id=5&name=Test#result", s)).toEqual(true);



	});
});
