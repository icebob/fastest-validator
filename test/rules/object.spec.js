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

	describe("should check entries", () => {
		const v = new Validator({
			useNewCustomCheckerFunction: true,
		});

		it("#276#issuecomment-962506034", () => {
			const check = v.compile({
				$$root: true,
				type: "object",
				props: {
					timestamp: "number",
					numUsers: "number",
					uptime: "number",
					users: {
						type: "object",
						entries: {
							key: {
								type: "string",
								pattern: /^[a-z_]+$/
							},
							value: {
								type: "object",
								props: {
									email: "email",
									account_type: {type: "string", enum: ["premium", "standard"]},
									last_login: "number"
								}
							}
						}
					}
				}
			});
			expect(check({
				timestamp: 1233113131,
				numUsers: 3,
				uptime: 201,
				users: {
					steve_carlos: {
						email: "steve.carlos@ffffff.com",
						account_type: "premium",
						last_login: 11244114
					},
					doug_flutey: {
						email: "doug.flutey@ggggg.com",
						account_type: "standard",
						last_login: 1251251231
					},
					mike_jones: {
						email: "mike.jones@hhhhh.com",
						account_type: "standard",
						last_login: 1295812951
					}
				}
			})).toBe(true);
		});

		it("must pass entries test", () => {
			const check = v.compile({
				$$root: true,
				type: "object",
				entries: {
					key: "string",
					value: ["number[]", {
						type: "object",
						entries: {
							key: "string",
							value: "number[]"
						},
					}],
				}
			});

			expect(check({
				foo: [1,2,3],
				bar: {
					foofoo: [0,1,2],
				}
			})).toBe(true);
			expect(check({
				foo: ["1",2,3],
				bar: {
					foofoo: [0,1,2]
				}
			})).toStrictEqual([
				{
					"actual": "1",
					"field": "foo[0]",
					"message": "The 'foo[0]' field must be a number.",
					"type": "number"
				},
				{
					"actual": [
						"1",
						2,
						3
					],
					"field": "foo",
					"message": "The 'foo' must be an Object.",
					"type": "object"
				}
			]);
			expect(check({
				foo: [1,2,3],
				bar: {
					foofoo: ["0",1,2]
				}
			})).toStrictEqual([
				{
					"actual": {
						"foofoo": [
							"0",
							1,
							2
						]
					},
					"field": "bar",
					"message": "The 'bar' field must be an array.",
					"type": "array"
				},
				{
					"actual": "0",
					"field": "bar[\"foofoo\"][0]",
					"message": "The 'bar[\"foofoo\"][0]' field must be a number.",
					"type": "number"
				}
			]);
			expect(check({
				foo: [1,2,3],
				bar: {
					["foo\"bar"]: [0,1,2],
					["foo'bar"]: [0,1,2],
					["foo\rbar"]: [0,1,2],
					["foo\nbar"]: [0,1,2],
					["foo\u2028bar"]: [0,1,2],
					["foo\u2029bar"]: [0,1,2],
				}
			})).toBe(true);
		});

		it("must pass multi entries test", () => {
			const check = v.compile({
				$$root: true,
				type: "object",
				entries: [{
					key: "string",
					value: "string"
				}, {
					// object always force key to string type
					// key: "number",
					value: ["number", "number[]"]
				}]
			});

			expect(check({
				a: "b",
				0: 1,
				2: [3, 4],
			})).toBe(true);
			expect(check({
				a: "b",
				0: 1,
				2: [3, 4],
				5: "6", // 5 will be converted to "5" and pass entries[0] test
			})).toBe(true);
			expect(check({
				a: "b",
				0: 1,
				2: ["3", 4],
				5: "6", // 5 will be converted to "5" and pass entries[0] test
			})).toStrictEqual([{"actual": ["3", 4], "field": "2", "message": "The '2' field must be a string.", "type": "string"}, {"actual": ["3", 4], "field": "2", "message": "The '2' field must be a number.", "type": "number"}, {"actual": "3", "field": "2[0]", "message": "The '2[0]' field must be a number.", "type": "number"}]);
		});

		describe("only key test", () => {
			it("without custom", () => {
				const check = v.compile({
					$$root: true,
					type: "object",
					entries: {
						key: "string|min:4",
					}
				});
				expect(check({
					"npm:1": "any",
					"npm:12": 123,
					"npm:123": [123, "234"],
				})).toBe(true);
				expect(check({
					"npm": "any",
					"npm:a": 123,
					"npm:a123": [123, "234"],
				})).toStrictEqual([{"actual": 3, "expected": 4, "field": "npm", "message": "The 'npm' field length must be greater than or equal to 4 characters long.", "type": "stringMin"}]);
				expect(check({
					"npm:1": "any",
					"npm:a": 123,
					"npx": [123, "234"],
				})).toStrictEqual([{"actual": 3, "expected": 4, "field": "npx", "message": "The 'npx' field length must be greater than or equal to 4 characters long.", "type": "stringMin"}]);
			});
			it("with custom", ()=>{
				const check = v.compile({
					$$root: true,
					type: "object",
					entries: {
						key: {
							type: "string",
							custom(value, errors) {
								if (/^npm:\d+$/.test(value)) return value;
								errors.push({
									type: "custom-string",
								});
							},
						},
					}
				});
				expect(check({
					"npm:1": "any",
					"npm:12": 123,
					"npm:123": [123, "234"],
				})).toBe(true);
				expect(check({
					"npm:": "any",
					"npm:a": 123,
					"npm:a123": [123, "234"],
				})).toStrictEqual([{"field": "npm:", "message": undefined, "type": "custom-string"}]);
				expect(check({
					"npm:1": "any",
					"npm:a": 123,
					"npm:a123": [123, "234"],
				})).toStrictEqual([{"field": "npm:a", "message": undefined, "type": "custom-string"}]);
			});
		});

		describe("only value test", () => {
			it("without custom", () => {
				const check = v.compile({
					$$root: true,
					type: "object",
					entries: {
						value: "string|min:4",
					}
				});
				expect(check({
					"npm:1": "any123",
					"npm:123": "yesss",
				})).toBe(true);
				expect(check({
					"npm": "any",
					"npm:a123": ["12344", "1111234"],
				})).toStrictEqual([{"actual": 3, "expected": 4, "field": "npm", "message": "The 'npm' field length must be greater than or equal to 4 characters long.", "type": "stringMin"}]);
				expect(check({
					"npm:1": "any",
					"npm:a": 123,
					"npx": [123, "234"],
				})).toStrictEqual([{"actual": 3, "expected": 4, "field": "npm:1", "message": "The 'npm:1' field length must be greater than or equal to 4 characters long.", "type": "stringMin"}]);
			});
			it("with custom", ()=>{
				const check = v.compile({
					$$root: true,
					type: "object",
					entries: {
						value: {
							type: "string",
							custom(value, errors) {
								if (/^npm:\d+$/.test(value)) return value;
								errors.push({
									type: "custom-string",
								});
							},
						},
					}
				});
				expect(check({
					a1: "npm:1",
					a2: "npm:12",
					a3: "npm:123",
				})).toBe(true);
				expect(check({
					"npm:": "any",
					"npm:a": 123,
					"npm:a123": [123, "234"],
				})).toStrictEqual([{"field": "npm:", "message": undefined, "type": "custom-string"}]);
				expect(check({
					"npm:1": "any",
					"npm:a": 123,
					"npm:a123": [123, "234"],
				})).toStrictEqual([{"field": "npm:1", "message": undefined, "type": "custom-string"}]);
			});
		});
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
});
