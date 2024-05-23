"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: luhn", () => {

	it("should check type of value", () => {
		const check = v.compile({ $$root: true, type: "luhn" });
		let message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);

		message = "The '' field must be a valid checksum luhn.";
		expect(check("")).toEqual([{ type: "luhn", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "luhn", actual: "true", message }]);
		expect(check("452373989911198")).toEqual([{ type: "luhn", actual: "452373989911198", message }]);
		expect(check("452373989901199")).toEqual([{ type: "luhn", actual: "452373989901199", message }]);
		expect(check("452373989901198")).toEqual(true);
		expect(check("4523-739-8990-1198")).toEqual(true);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "luhn"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

		let message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);

		message = "The '' field must be a valid checksum luhn.";
		expect(check("")).toEqual([{ type: "luhn", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "luhn", actual: "true", message }]);
		expect(check("452373989911198")).toEqual([{ type: "luhn", actual: "452373989911198", message }]);
		expect(check("452373989901199")).toEqual([{ type: "luhn", actual: "452373989901199", message }]);
		expect(check("452373989901198")).toEqual(true);
		expect(check("4523-739-8990-1198")).toEqual(true);
	});
});
