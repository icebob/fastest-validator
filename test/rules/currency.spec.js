"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: currency", () => {
	it("should have decimal optional, and correctly placed if present", () => {
		const check = v.compile({$$root: true, type: "currency", 'currencySymbol': '$', 'symbolOptional': true});
		expect(check("$12.2")).toEqual(true);
		expect(check("$12,222.2")).toEqual(true);
		expect(check("$12,222")).toEqual(true);
		expect(check("$12,222.0")).toEqual(true);
		expect(check("$1.22.00")).toEqual([{"actual": "$1.22.00", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should check comma placement is correct", () => {
		const check = v.compile({$$root: true, type: "currency", 'currencySymbol': '$', 'symbolOptional': true});
		expect(check("$12.2")).toEqual(true);
		expect(check("$12,222.2")).toEqual(true);
		expect(check("$122,222.2")).toEqual(true);
		expect(check("$1234,222.2")).toEqual([{"actual": "$1234,222.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
		expect(check("$1,2,222")).toEqual( [{"actual": "$1,2,222", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should not allow any currency symbol , if not supplied in schema", () => {
		let check = v.compile({$$root: true, type: "currency"});
		expect(check("12.2")).toEqual(true);
		expect(check("$12.2")).toEqual( [{"actual": "$12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should not allow any other currency symbol, other than supplied in schema", () => {
		let check = v.compile({$$root: true, type: "currency", 'currencySymbol': '$', 'symbolOptional': false});
		expect(check("$12.2")).toEqual(true);
		expect(check("#12.2")).toEqual([{"actual": "#12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should keep currency symbol optional, if symbolOptional is true in schema", () => {
		let check = v.compile({$$root: true, type: "currency", 'currencySymbol': '$', 'symbolOptional': true});
		expect(check("$12.2")).toEqual(true);
		expect(check("12.2")).toEqual(true);
		expect(check("#12.2")).toEqual([{"actual": "#12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]
		);
	});
});
