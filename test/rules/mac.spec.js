"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/mac");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkMAC", () => {

	it("should check type of value", () => {
		const mac = {type: "mac"};
		const err = {type: "mac"};
		const errString = {type: "string"};

		expect(check(null, mac)).toEqual(errString);
		expect(check(undefined, mac)).toEqual(errString);
		expect(check(0, mac)).toEqual(errString);
		expect(check(1, mac)).toEqual(errString);
		expect(check("", mac)).toEqual(err);
		expect(check("true", mac)).toEqual(err);
		expect(check([], mac)).toEqual(errString);
		expect(check({}, mac)).toEqual(errString);
		expect(check(false, mac)).toEqual(errString);
		expect(check(true, mac)).toEqual(errString);
		expect(check("018.954B.65FE", mac)).toEqual(err);
		expect(check("01C8.95B.65FE", mac)).toEqual(err);
		expect(check("01C8.954B.6FE", mac)).toEqual(err);
		expect(check("1-C8-95-4B-65-FE", mac)).toEqual(err);
		expect(check("01-C8-95-4B-65-F", mac)).toEqual(err);
		expect(check("01-C8-95-4B-65-FE-A0", mac)).toEqual(err);
		expect(check("1:C8:95:4B:65:FE", mac)).toEqual(err);
		expect(check("01:8:95:4B:65:FE", mac)).toEqual(err);
		expect(check("01:C8:95:4B:65:F", mac)).toEqual(err);
		expect(check("01:C8:95:4B:65:FE:AF", mac)).toEqual(err);
		expect(check("01:c8:95:4b:65:fe", mac)).toEqual(true);
		expect(check("01:C8:95:4B:65:FE", mac)).toEqual(true);
		expect(check("01c8.954b.65fe", mac)).toEqual(true);
		expect(check("01C8.954B.65FE", mac)).toEqual(true);
		expect(check("01-C8-95-4B-65-FE", mac)).toEqual(true);
		expect(check("01-c8-95-4b-65-fe", mac)).toEqual(true);
	});

});
