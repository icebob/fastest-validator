"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: email", () => {
	it("should check empty values", () => {
		const check = v.compile({ $$root: true, type: "email", empty: true });

		expect(check("john.doe@company.net")).toEqual(true);
		expect(check("")).toEqual(true);
	});

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "email" });
		const message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "emailEmpty", actual: "", message: "The '' field must not be empty." }]);
		expect(check("true")).toEqual([{ type: "email", actual: "true", message: "The '' field must be a valid e-mail." }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);
	});

	it("should check values with quick pattern", () => {
		const check = v.compile({ $$root: true, type: "email" });
		const message = "The '' field must be a valid e-mail.";

		expect(check("abcdefg")).toEqual([{ type: "email", actual: "abcdefg", message }]);
		expect(check("1234")).toEqual([{ type: "email", actual: "1234", message }]);
		expect(check("abc@gmail")).toEqual([{ type: "email", actual: "abc@gmail", message }]);
		expect(check("@gmail.com")).toEqual([{ type: "email", actual: "@gmail.com", message }]);

		// Invalid but we are in quick mode
		expect(check("https://john@company.net")).toEqual(true);

		expect(check("john.doe@company.net")).toEqual(true);
		expect(check("james.123.45@mail.co.uk")).toEqual(true);
		expect(check("admin@nasa.space")).toEqual(true);
	});

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "email", mode: "precise" });
		const message = "The '' field must be a valid e-mail.";

		expect(check("abcdefg")).toEqual([{ type: "email", actual: "abcdefg", message }]);
		expect(check("1234")).toEqual([{ type: "email", actual: "1234", message }]);
		expect(check("abc@gmail")).toEqual([{ type: "email", actual: "abc@gmail", message }]);
		expect(check("@gmail.com")).toEqual([{ type: "email", actual: "@gmail.com", message }]);
		expect(check("https://john@company.net")).toEqual([{ type: "email", actual: "https://john@company.net", message }]);

		expect(check("john.doe@company.net")).toEqual(true);
		expect(check("james.123.45@mail.co.uk")).toEqual(true);
		expect(check("admin@nasa.space")).toEqual(true);
	});

	it("should not normalize", () => {
		const check = v.compile({ email: { type: "email" } });

		const obj = { email: "John.Doe@Gmail.COM" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({
			email: "John.Doe@Gmail.COM"
		});
	});

	it("should normalize", () => {
		const check = v.compile({ email: { type: "email", normalize: true } });

		const obj = { email: " John.Doe@Gmail.COM   " };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({
			email: "john.doe@gmail.com"
		});
	});

	it("check min length", () => {
		const check = v.compile({ $$root: true, type: "email", min: 10 });

		expect(check("a@a.com")).toEqual([{ type: "emailMin", expected: 10, actual: 7, message: "The '' field length must be greater than or equal to 10 characters long." }]);
		expect(check("sssa@a.com")).toEqual(true);
	});

	it("check max length", () => {
		const check = v.compile({ $$root: true, type: "email", max: 20 });

		expect(check("sssa@a.com")).toEqual(true);
		expect(check("veryLongEmailAddress@veryLongProviderName.com")).toEqual([{ type: "emailMax", expected: 20, actual: 45, message: "The '' field length must be less than or equal to 20 characters long." }]);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "email",
			empty: true
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(schema).toStrictEqual(clonedSchema);
		expect(check("john.doe@company.net")).toEqual(true);
		expect(check("")).toEqual(true);
	});

});
