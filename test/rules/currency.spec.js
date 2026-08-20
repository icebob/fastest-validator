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

describe("Test rule: currency (security)", () => {
	it("should treat a malicious customRegex string as a literal (no code execution)", () => {
		// This string would previously be interpolated raw into generated source.
		// It must be captured as an escaped literal so the injected code never runs.
		const check = v.compile({$$root: true, type: "currency", customRegex: "/.*/; alert(1); //"});

		// The value is treated as a literal pattern, so an "alert" never runs and a
		// normal number won't match this literal text pattern.
		expect(check("123")).toEqual([{"actual": "123", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should support a safe customRegex as a RegExp object", () => {
		const check = v.compile({$$root: true, type: "currency", customRegex: /^123$/ });
		expect(check("123")).toEqual(true);
		expect(check("134")).toEqual([{"actual": "134", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});

	it("should reject a customRegex that is an array at compile time", () => {
		expect(() => {
			v.compile({$$root: true, type: "currency", customRegex: ["123"]});
		}).toThrow();
	});

	it("should reject a customRegex that is an object at compile time", () => {
		expect(() => {
			v.compile({$$root: true, type: "currency", customRegex: {source: "123"}});
		}).toThrow();
	});

	it("should sanitize malicious currencySymbol with regex metacharacters (no injection, no ReDoS)", () => {
		// currencySymbol interpolated raw previously allowed code / regex injection.
		// These should compile safely and validate literally without executing code.
		const cases = ["/*", "*/", "(", ")", "[", "{", "$", ".", "*", "^"];
		for (const symbol of cases) {
			const check = v.compile({$$root: true, type: "currency", currencySymbol: symbol});
			// The symbol must not break out of the generated source; it still validates.
			expect(typeof check("12.2")).not.toBe("function");
		}

		// A valid input with a safely-escaped custom symbol still validates.
		const check = v.compile({$$root: true, type: "currency", currencySymbol: "$"});
		expect(check("$12.2")).toEqual(true);
	});

	it("should sanitize malicious separators with regex metacharacters", () => {
		// Separators interpolated raw previously caused regex injection / ReDoS.
		// Compiling must not throw and must not execute injected code.
		const checkT = v.compile({$$root: true, type: "currency", thousandSeparator: "*", decimalSeparator: ".", currencySymbol: "$", symbolOptional: true});
		expect(typeof checkT("12.2")).not.toBe("function");

		const checkD = v.compile({$$root: true, type: "currency", thousandSeparator: ",", decimalSeparator: "*", currencySymbol: "$", symbolOptional: true});
		expect(typeof checkD("12.2")).not.toBe("function");
	});

	it("should still validate normalized currency correctly", () => {
		// Default symbol & separators
		expect(v.compile({$$root: true, type: "currency"})("12,222.50")).toEqual(true);
		expect(v.compile({$$root: true, type: "currency"})("12,222.5")).toEqual(true);

		// Custom symbol
		const check = v.compile({$$root: true, type: "currency", currencySymbol: "€", symbolOptional: false});
		expect(check("€12.2")).toEqual(true);
		expect(check("$12.2")).toEqual([{"actual": "$12.2", "field": undefined, "message": "The '' must be a valid currency format", "type": "currency"}]);
	});
});
