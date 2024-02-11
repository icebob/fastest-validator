"use strict";

const Validator = require("../../lib/validator");

const v = new Validator();

describe("Test rule: date", () => {

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "date" });
		const message = "The '' field must be a Date.";

		expect(check(0)).toEqual([{ type: "date", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "date", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "date", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "date", actual: "true", message }]);
		expect(check("false")).toEqual([{ type: "date", actual: "false", message }]);
		expect(check([])).toEqual([{ type: "date", actual: [], message }]);
		expect(check({})).toEqual([{ type: "date", actual: {}, message }]);

		const now = Date.now();
		expect(check(now)).toEqual([{ type: "date", actual: now, message }]);

		expect(check(new Date())).toEqual(true);
		expect(check(new Date(1488876927958))).toEqual(true);
	});

	it("should convert & check values", () => {
		const check = v.compile({ $$root: true, type: "date", convert: true });
		const message = "The '' field must be a Date.";

		expect(check(Date.now())).toEqual(true);
		expect(check(String(Date.now()))).toEqual(true);
		expect(check("2017-03-07 10:11:23")).toEqual(true);
		expect(check("2017-03-07T10:11:23Z")).toEqual(true);
		expect(check("2017-03-07T10:11:23-01:00")).toEqual(true);
		expect(check("Wed Mar 25 2015 09:56:24 GMT+0100 (W. Europe Standard Time)")).toEqual(true);

		expect(check("")).toEqual([{ type: "date", actual: "", message }]);
		expect(check("asd")).toEqual([{ type: "date", actual: "asd", message }]);
	});

	it("should sanitize", () => {
		const check = v.compile({ timestamp: { type: "date", convert: true } });

		let obj = { timestamp: 1488876927958 };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ timestamp: new Date(1488876927958) });

		obj = { timestamp: "1488876927958" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ timestamp: new Date(1488876927958) });

		obj = { timestamp: "2017-03-07 10:11:23" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ timestamp: new Date("2017-03-07 10:11:23") });

		obj = { timestamp: "2017-03-07T10:11:23Z" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ timestamp: new Date("2017-03-07T10:11:23Z") });

		obj = { timestamp: "Wed Mar 25 2015 09:56:24 GMT+0100 (W. Europe Standard Time)" };
		expect(check(obj)).toEqual(true);
		expect(obj).toEqual({ timestamp: new Date("Wed Mar 25 2015 09:56:24 GMT+0100 (W. Europe Standard Time)") });
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "date"
		};
		const clonedSchema = {...schema};
		expect(schema).toStrictEqual(clonedSchema);
		const check = v.compile(schema);
		const message = "The '' field must be a Date.";

		expect(check(0)).toEqual([{ type: "date", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "date", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "date", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "date", actual: "true", message }]);
		expect(check("false")).toEqual([{ type: "date", actual: "false", message }]);
		expect(check([])).toEqual([{ type: "date", actual: [], message }]);
		expect(check({})).toEqual([{ type: "date", actual: {}, message }]);

		const now = Date.now();
		expect(check(now)).toEqual([{ type: "date", actual: now, message }]);

		expect(check(new Date())).toEqual(true);
		expect(check(new Date(1488876927958))).toEqual(true);

	});
});
