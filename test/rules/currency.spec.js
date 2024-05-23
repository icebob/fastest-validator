"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: currency", () => {
	it("should have decimal optional, and correctly placed if present", () => {
		const check = v.compile({$$root: true, type: "currency", "currencySymbol": "$", "symbolOptional": true});
		expect(check("$12.2")).toEqual(true);
		expect(check("$12,222.2")).toEqual(true);
		expect(check("$12,222")).toEqual(true);
		expect(check("$12,222.0")).toEqual(true);
		expect(check("$1.22.00")).toEqual([{"actual": "$1.22.00", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should check thousand separator placement is correct", () => {
		const check = v.compile({$$root: true, type: "currency", "currencySymbol": "$", "symbolOptional": true});
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
		let check = v.compile({$$root: true, type: "currency", "currencySymbol": "$", "symbolOptional": false});
		expect(check("$12.2")).toEqual(true);
		expect(check("#12.2")).toEqual([{"actual": "#12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should keep currency symbol optional, if symbolOptional is true in schema", () => {
		let check = v.compile({$$root: true, type: "currency", "currencySymbol": "$", "symbolOptional": true});
		expect(check("$12.2")).toEqual(true);
		expect(check("12.2")).toEqual(true);
		expect(check("#12.2")).toEqual([{"actual": "#12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]
		);
	});

	it("should allow negative currencies", () => {
		let check = v.compile({$$root: true, type: "currency", "currencySymbol": "$", "symbolOptional": true});
		expect(check("-12.2")).toEqual(true);
		expect(check("$-12.2")).toEqual(true);
		expect(check("-$12.2")).toEqual(true);
		expect(check("-$-12.2")).toEqual([{"actual": "-$-12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should work correctly with supplied thousand and decimal separator", () => {
		let check = v.compile({$$root: true, type: "currency", "currencySymbol": "$", "symbolOptional": true, "thousandSeparator":".", "decimalSeparator":","});
		expect(check("$12,2")).toEqual(true);
		expect(check("$12.222")).toEqual(true);
		expect(check("$12.222,2")).toEqual(true);
		expect(check("$12,222.2")).toEqual([{"actual": "$12,222.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});
	it("should work correctly with supplied regex pattern", () => {
		let check = v.compile({$$root: true, type: "currency", "customRegex": /123/g});
		expect(check("123")).toEqual(true);
		expect(check("134")).toEqual([{"actual": "134", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "currency"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(schema).toStrictEqual(clonedSchema);

		expect(check("12.2")).toEqual(true);
		expect(check("$12.2")).toEqual( [{"actual": "$12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});
});
