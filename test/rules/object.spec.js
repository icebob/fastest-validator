"use strict";

const Validator = require("../../lib/validator");
const v = new Validator({ debug: false });

describe("Test rule: object", () => {

	it("should check values", () => {
		const check = v.compile({ $$root: true, type: "object" });
		const message = "The '' must be an Object.";

		expect(check(0)).toEqual([{ type: "object", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "object", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "object", actual: "", message }]);
		expect(check(false)).toEqual([{ type: "object", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "object", actual: true, message }]);
		expect(check([])).toEqual([{ type: "object", actual: [], message }]);
		expect(check({})).toEqual(true);
		expect(check({ a: "John" })).toEqual(true);
	});

	it("should check strict object", () => {
		const check = v.compile({ $$root: true, type: "object", strict: true, properties: {} });
		expect(check({})).toEqual(true);
		expect(check({ a: "John" })).toEqual([{ type: "objectStrict", actual: "a", expected: "", message: "The object '' contains forbidden keys: 'a'." }]);
	});

	it("should check strict object #2", () => {
		const check = v.compile({ $$root: true, type: "object", strict: true, props: {
			a: { type: "string", trim: true }
		} });
		expect(check({ a: "John", b: "Doe" })).toEqual([{ type: "objectStrict", actual: "b", expected: "a", message: "The object '' contains forbidden keys: 'b'." }]);

		const o = { a: "    John" };
		expect(check(o)).toEqual(true);
		expect(o.a).toBe("John");
	});

	it("should work with safe property name", () => {
		const check = v.compile({ $$root: true, type: "object", properties: {
			"read-only": "boolean",
			"op.tional": { type: "string", optional: true }
		} });
		expect(check({})).toEqual([{ type: "required", field: "read-only", actual: undefined, message: "The 'read-only' field is required." }]);
		expect(check({ "read-only": false })).toEqual(true);
	});

	it("should work with nested fields", () => {
		const check = v.compile({ user: { type: "object", properties: {
			firstName: "string",
			address: { type: "object", properties: {
				country: "string",
				city: "string"
			} }
		} } });
		expect(check({ user: { firstName: "John", address: { country: "UK" }}}))
			.toEqual([{ type: "required", field: "user.address.city", actual: undefined, message: "The 'user.address.city' field is required." }]);
	});

	it("should check min props", () => {
		const check = v.compile({ $$root: true, type: "object", props: {
			optional_key_1: { type: "string", optional: true },
			optional_key_2: { type: "number", optional: true },
			optional_key_3: { type: "boolean", optional: true },
			optional_key_4: { type: "array", optional: true },
		}, minProps: 2 });

		expect(check({})).toEqual([{ type: "objectMinProps", actual: 0, expected: 2, message: "The object '' must contain at least 2 properties.", field: undefined }]);
		expect(check({ optional_key_1: "foobar", optional_key_2: 9 })).toEqual(true);
		expect(check({ optional_key_1: "foobar", optional_key_2: 9, optional_key_3: false })).toEqual(true);

		const checkNested = v.compile({
			key: { type: "object",
				props: {
					nested: {
						type: "object",
						props: {
							optional_key_1: { type: "string", optional: true },
							optional_key_2: { type: "number", optional: true },
						},
						minProps: 1
					}
				}
			},
		});

		expect(checkNested({ key: { nested: {} } })).toEqual([{ type: "objectMinProps", actual: 0, expected: 1, message: "The object 'key.nested' must contain at least 1 properties.", field: "key.nested" }]);
		expect(checkNested({ key: { nested: { optional_key_1: "foobar" } } })).toEqual(true);
		expect(v.validate({}, {$$root: true, type: "object", minProps: 0})).toEqual(true);
	});

	it("should check max props", () => {
		const check = v.compile({ $$root: true, type: "object", props: {
			optional_key_1: { type: "string", optional: true },
			optional_key_2: { type: "number", optional: true },
			optional_key_3: { type: "boolean", optional: true },
			optional_key_4: { type: "array", optional: true },
		}, maxProps: 2 });

		expect(check({ optional_key_1: "foobar", optional_key_2: 9, optional_key_3: true })).toEqual([{ type: "objectMaxProps", actual: 3, expected: 2, message: "The object '' must contain 2 properties at most.", field: undefined }]);
		expect(check({ optional_key_1: "foobar", optional_key_2: 9 })).toEqual(true);
		expect(check({ optional_key_2: 9 })).toEqual(true);
		expect(check({})).toEqual(true);

		const checkWithStrict = v.compile({ $$root: true, type: "object", strict: "remove", props: {
			optional_key_1: { type: "string" },
			optional_key_2: { type: "number" },
		}, maxProps: 2 });

		expect(checkWithStrict({ optional_key_1: "foobar", optional_key_2: 9, optional_key_3: true })).toEqual(true);

		const checkNested = v.compile({
			key: { type: "object",
				props: {
					nested: {
						type: "object",
						props: {
							optional_key_1: { type: "string", optional: true },
							optional_key_2: { type: "number", optional: true },
						},
						maxProps: 1
					}
				}
			},
		});

		expect(checkNested({ key: { nested: {} } })).toEqual(true);
		expect(checkNested({ key: { nested: { optional_key_1: "foobar" } } })).toEqual(true);
		expect(checkNested({ key: { nested: { optional_key_1: "foobar", optional_key_3: 99 } } })).toEqual([{ type: "objectMaxProps", actual: 2, expected: 1, message: "The object 'key.nested' must contain 1 properties at most.", field: "key.nested" }]);

		expect(v.validate({}, {$$root: true, type: "object", maxProps: 0})).toEqual(true);
		expect(v.validate({foo:"bar"}, {$$root: true, type: "object", maxProps: 0})).toEqual([{actual: 1, field: undefined, message: "The object '' must contain 0 properties at most.", type: "objectMaxProps", expected: 0}]);
		expect(v.validate({foo:"bar"}, {$$root: true, type: "object", maxProps: 0, strict: "remove"})).toEqual([{actual: 1, field: undefined, message: "The object '' must contain 0 properties at most.", type: "objectMaxProps", expected: 0}]);
	});

	it("shorthand label",()=>{
		const check = v.compile({ $$root: true, type: "object", props: { shorthand_label: "string|label:My Label" } });
		const res = check({ shorthand_label: 123 });
		expect(res[0].label).toEqual("My Label");
		
	});

	describe("Test sanitization", () => {

		it("should remove additional fields if 'strict: 'remove''", () => {
			let schema = {
				name: { type: "string" },
				address: { type: "object", strict: "remove", properties: {
					country: "string",
					city: "string"
				} }
			};
			let check = v.compile(schema);

			const obj = {
				name: "John",
				address: {
					country: "Hungary",
					city: "Budapest",
					street: "Kossuth Lajos street",
					zip: 1234
				}
			};

			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({
				name: "John",
				address: {
					country: "Hungary",
					city: "Budapest"
				}
			});
		});

	});


	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "object"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);
		const message = "The '' must be an Object.";

		expect(check(0)).toEqual([{ type: "object", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "object", actual: 1, message }]);
		expect(check("")).toEqual([{ type: "object", actual: "", message }]);
		expect(check(false)).toEqual([{ type: "object", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "object", actual: true, message }]);
		expect(check([])).toEqual([{ type: "object", actual: [], message }]);
		expect(check({})).toEqual(true);
		expect(check({ a: "John" })).toEqual(true);
	});
});
