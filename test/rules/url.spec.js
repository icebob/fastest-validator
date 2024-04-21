"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: url", () => {
	it("should check empty values", () => {
		const check = v.compile({ $$root: true, type: "url", empty: true });

		expect(check("https://google.com")).toEqual(true);
		expect(check("")).toEqual(true);
	});

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "url" });
		let message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);

		message = "The '' field must be a valid URL.";
		expect(check("")).toEqual([{ type: "urlEmpty", actual: "", message: "The '' field must not be empty." }]);
		expect(check("true")).toEqual([{ type: "url", actual: "true", message }]);
		expect(check("abcdefg")).toEqual([{ type: "url", actual: "abcdefg", message }]);
		expect(check("1234.c")).toEqual([{ type: "url", actual: "1234.c", message }]);
		expect(check("gmail.company1234")).toEqual([{ type: "url", actual: "gmail.company1234", message }]);
		expect(check("@gmail.com")).toEqual([{ type: "url", actual: "@gmail.com", message }]);
		expect(check("https://")).toEqual([{ type: "url", actual: "https://", message }]);

		expect(check("http://www.google.com")).toEqual(true);
		expect(check("https://google.com")).toEqual(true);
		expect(check("http://nasa.gov")).toEqual(true);
		expect(check("https://github.com")).toEqual(true);
		expect(check("http://github.com/icebob/fastest-validator")).toEqual(true);
		expect(check("http://clipboard.space")).toEqual(true);
		expect(check("https://localhost:3000/?id=5&name=Test#result")).toEqual(true);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "url"
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

		message = "The '' field must be a valid URL.";
		expect(check("")).toEqual([{ type: "urlEmpty", actual: "", message: "The '' field must not be empty." }]);
		expect(check("true")).toEqual([{ type: "url", actual: "true", message }]);
		expect(check("abcdefg")).toEqual([{ type: "url", actual: "abcdefg", message }]);
		expect(check("1234.c")).toEqual([{ type: "url", actual: "1234.c", message }]);
		expect(check("gmail.company1234")).toEqual([{ type: "url", actual: "gmail.company1234", message }]);
		expect(check("@gmail.com")).toEqual([{ type: "url", actual: "@gmail.com", message }]);
		expect(check("https://")).toEqual([{ type: "url", actual: "https://", message }]);

		expect(check("http://www.google.com")).toEqual(true);
		expect(check("https://google.com")).toEqual(true);
		expect(check("http://nasa.gov")).toEqual(true);
		expect(check("https://github.com")).toEqual(true);
		expect(check("http://github.com/icebob/fastest-validator")).toEqual(true);
		expect(check("http://clipboard.space")).toEqual(true);
		expect(check("https://localhost:3000/?id=5&name=Test#result")).toEqual(true);
	});
});
