"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: enum", () => {

	it("check enum", () => {
		const check = v.compile({ $$root: true, type: "enum", values: ["male", "female"] });

		expect(check("")).toEqual([{ type: "enumValue", expected: "male, female", actual: "", message: "The '' field value 'male, female' does not match any of the allowed values." }]);
		expect(check("human")).toEqual([{ type: "enumValue", expected: "male, female", actual: "human", message: "The '' field value 'male, female' does not match any of the allowed values." }]);
		expect(check("male")).toEqual(true);
		expect(check("female")).toEqual(true);
	});

	it("check enum", () => {
		const check = v.compile({ $$root: true, type: "enum", values: [null, 1, 2, "done", false] });

		expect(check("male")).toEqual([{ type: "enumValue", expected: ", 1, 2, done, false", actual: "male", message: "The '' field value ', 1, 2, done, false' does not match any of the allowed values." }]);
		expect(check(2)).toEqual(true);
		expect(check("done")).toEqual(true);
		expect(check(false)).toEqual(true);
	});

	it("should handle enum values containing double-quotes", () => {
		const check = v.compile({ $$root: true, type: "enum", values: ["active", "in\"active", "pending"] });

		expect(check("active")).toEqual(true);
		expect(check("pending")).toEqual(true);
		expect(check("bad")).toEqual([{
			type: "enumValue",
			expected: "active, in\"active, pending",
			actual: "bad",
			message: "The '' field value 'active, in\"active, pending' does not match any of the allowed values."
		}]);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "enum",
			values: ["male", "female"]
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

		expect(check("")).toEqual([{ type: "enumValue", expected: "male, female", actual: "", message: "The '' field value 'male, female' does not match any of the allowed values." }]);
		expect(check("human")).toEqual([{ type: "enumValue", expected: "male, female", actual: "human", message: "The '' field value 'male, female' does not match any of the allowed values." }]);
		expect(check("male")).toEqual(true);
		expect(check("female")).toEqual(true);
	});
});
