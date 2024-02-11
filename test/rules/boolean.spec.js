"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: boolean", () => {

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "boolean" });
		const message = "The '' field must be a boolean.";

		expect(check(0)).toEqual([{ type: "boolean", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "boolean", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "boolean", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "boolean", actual: "true", message }]);
		expect(check("false")).toEqual([{ type: "boolean", actual: "false", message }]);
		expect(check([])).toEqual([{ type: "boolean", actual: [], message }]);
		expect(check({})).toEqual([{ type: "boolean", actual: {}, message }]);

		expect(check(false)).toEqual(true);
		expect(check(true)).toEqual(true);
	});

	it("should convert & check values", () => {
		const check = v.compile({ $$root: true, type: "boolean", convert: true });
		const message = "The '' field must be a boolean.";

		expect(check(0)).toEqual(true);
		expect(check(1)).toEqual(true);
		expect(check("")).toEqual([{ type: "boolean", actual: "", message }]);
		expect(check("true")).toEqual(true);
		expect(check("false")).toEqual(true);
		expect(check("on")).toEqual(true);
		expect(check("off")).toEqual(true);
		expect(check([])).toEqual([{ type: "boolean", actual: [], message }]);
		expect(check({})).toEqual([{ type: "boolean", actual: {}, message }]);

		expect(check(false)).toEqual(true);
		expect(check(true)).toEqual(true);
	});

	it("should sanitize", () => {
		const check = v.compile({ status: { type: "boolean", convert: true } });

		let obj = { status: 0 };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ status: false });

		obj = { status: 1 };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ status: true });

		obj = { status: "true" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ status: true });

		obj = { status: "false" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ status: false });

		obj = { status: "off" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ status: false });

		obj = { status: "on" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ status: true });
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "boolean",
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(schema).toStrictEqual(clonedSchema);

		const message = "The '' field must be a boolean.";

		expect(check(0)).toEqual([{ type: "boolean", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "boolean", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "boolean", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "boolean", actual: "true", message }]);
		expect(check("false")).toEqual([{ type: "boolean", actual: "false", message }]);
		expect(check([])).toEqual([{ type: "boolean", actual: [], message }]);
		expect(check({})).toEqual([{ type: "boolean", actual: {}, message }]);

		expect(check(false)).toEqual(true);
		expect(check(true)).toEqual(true);
	});
});
