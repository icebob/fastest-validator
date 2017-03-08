"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/date");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkDate", () => {

	it("should check values", () => {
		const s = { type: "date" };
		const err = { type: "date", args: [] };

		expect(check(null, s)).toEqual(err);
		expect(check(undefined, s)).toEqual(err);
		expect(check(0, s)).toEqual(err);
		expect(check(1, s)).toEqual(err);
		expect(check("", s)).toEqual(err);
		expect(check("true", s)).toEqual(err);
		expect(check("false", s)).toEqual(err);
		expect(check([], s)).toEqual(err);
		expect(check({}, s)).toEqual(err);

		expect(check(Date.now(), s)).toEqual(err);
		
		expect(check(new Date(), s)).toEqual(true);
		expect(check(new Date(1488876927958), s)).toEqual(true);
	});
	
	it("should convert & check values", () => {
		const s = { type: "date", convert: true };
		const err = { type: "date", args: [] };
		
		expect(check(null, s)).toEqual(true);
		expect(check(Date.now(), s)).toEqual(true);
		expect(check("2017-03-07 10:11:23", s)).toEqual(true);
		expect(check("2017-03-07T10:11:23Z", s)).toEqual(true);
		expect(check("2017-03-07T10:11:23-01:00", s)).toEqual(true);
		expect(check("Wed Mar 25 2015 09:56:24 GMT+0100 (W. Europe Standard Time)", s)).toEqual(true);

		expect(check("", s)).toEqual(err);
		expect(check("asd", s)).toEqual(err);		
		expect(check(undefined, s)).toEqual(err);
	});


});
