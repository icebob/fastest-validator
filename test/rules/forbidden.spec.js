"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: forbidden", () => {

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "forbidden" });
		const message = "The '' field is forbidden.";
		expect(check(null)).toEqual(true);
		expect(check(undefined)).toEqual(true);
		expect(check(0)).toEqual([{ type: "forbidden", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "forbidden", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "forbidden", actual: "", message }]);
		expect(check("null")).toEqual([{ type: "forbidden", actual: "null", message }]);
		expect(check([])).toEqual([{ type: "forbidden", actual: [], message }]);
		expect(check({})).toEqual([{ type: "forbidden", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "forbidden", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "forbidden", actual: true, message }]);
	});


	describe("Test sanitization", () => {

		it("should remove the field if 'remove: true'", () => {
			let schema = {
				id: { type: "number" },
				name: { type: "string" },
				token: { type: "forbidden", remove: true }
			};
			let check = v.compile(schema);

			const obj = {
				id: 2,
				name: "John"
			};

			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({
				id: 2,
				name: "John"
			});
		});

	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "forbidden"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

		const message = "The '' field is forbidden.";
		expect(check(null)).toEqual(true);
		expect(check(undefined)).toEqual(true);
		expect(check(0)).toEqual([{ type: "forbidden", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "forbidden", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "forbidden", actual: "", message }]);
		expect(check("null")).toEqual([{ type: "forbidden", actual: "null", message }]);
		expect(check([])).toEqual([{ type: "forbidden", actual: [], message }]);
		expect(check({})).toEqual([{ type: "forbidden", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "forbidden", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "forbidden", actual: true, message }]);
	});

});
