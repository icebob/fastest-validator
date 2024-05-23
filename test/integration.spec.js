"use strict";

const Validator = require("../lib/validator");
const {RuleEmail} = require("../index");

describe("Test flat schema", () => {
	const v = new Validator();

	let schema = {
		id: { type: "number", positive: true },
		name: { type: "string" },
		age: { type: "number", min: 18, max: 99 }
	};
	let check = v.compile(schema);

	it("should give true if obj is valid", () => {
		let obj = {
			id: 3,
			name: "John",
			age: 32
		};

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give errors", () => {
		expect(check({
			id: 3,
			name: "John"
		})).toEqual([{ "type": "required", field: "age", actual: undefined, message: "The 'age' field is required."}]);

		expect(check({
			id: 3,
			name: "John",
			age: "32"
		})).toEqual([{ "type": "number", field: "age", actual: "32", message: "The 'age' field must be a number."}]);

		expect(check({
			id: 3,
			name: "John",
			age: 8
		})).toEqual([{ "type": "numberMin", field: "age", actual: 8, expected: 18, message: "The 'age' field must be greater than or equal to 18."}]);
	});

});

describe("Test nested schema", () => {
	const v = new Validator();

	let schema = {
		id: { type: "number", positive: true },
		name: { type: "string" },
		address: { type: "object", properties: {
			country: { type: "string" },
			city: { type: "string" },
			zip: { type: "number", min: 100, max: 99999}
		}}
	};
	let check = v.compile(schema);

	it("should give true if obj is valid", () => {
		let obj = {
			id: 3,
			name: "John",
			address: {
				country: "Germany",
				city: "Munchen",
				zip: 4455
			}
		};

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give errors", () => {
		let obj = {
			id: 0,
			name: "John",
			address: {
				city: "Munchen",
				zip: 55
			}
		};

		let res = check(obj);

		expect(res.length).toBe(3);
		expect(res[0].type).toBe("numberPositive");
		expect(res[0].field).toBe("id");

		expect(res[1].type).toBe("required");
		expect(res[1].field).toBe("address.country");

		expect(res[2].type).toBe("numberMin");
		expect(res[2].field).toBe("address.zip");
	});

});

describe("Test 3 level nested schema", () => {
	const v = new Validator();

	let schema = {
		a: { type: "object", properties: {
			b: { type: "object", properties: {
				c: { type: "string", min: 5}
			}}
		}}
	};
	let check = v.compile(schema);

	it("should give true if obj is valid", () => {
		let obj = {
			a: {
				b: {
					c: "John Doe"
				}
			}
		};

		let res = check(obj);
		expect(res).toBe(true);
	});

	it("should give errors (flatten)", () => {
		let obj = {
			a: {
				b: {
					c: "John"
				}
			}
		};

		let res = check(obj);

		expect(res.length).toBe(1);
		expect(res[0].type).toBe("stringMin");
		expect(res[0].field).toBe("a.b.c");
		expect(res[0].message).toBe("The 'a.b.c' field length must be greater than or equal to 5 characters long.");
	});

});

describe("Test nested array", () => {
	const v = new Validator();

	let schema = {
		arr1: { type: "array", items: {
			type: "array", empty: false, items: {
				type: "number"
			}
		}}
	};
	let check = v.compile(schema);

	it("should give true if obj is valid", () => {
		let obj = {
			arr1: [
				[
					5,
					10
				],
				[
					1,
					2
				]
			]
		};

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give error 'not a number'", () => {
		let obj = {
			arr1: [
				[
					5,
					10
				],
				[
					"1",
					2
				]
			]
		};

		let res = check(obj);

		expect(res.length).toBe(1);
		expect(res[0].type).toBe("number");
		expect(res[0].field).toBe("arr1[1][0]");
	});

	it("should give error 'empty array'", () => {
		let obj = {
			arr1: [
				[
				],
				[
					1,
					2
				]
			]
		};

		let res = check(obj);

		expect(res.length).toBe(1);
		expect(res[0].type).toBe("arrayEmpty");
		expect(res[0].field).toBe("arr1[0]");
	});

});

describe("Test 3-level array", () => {
	const v = new Validator();

	let schema = {
		arr1: { type: "array", items: {
			type: "array", items: {
				type: "array", items: "string"
			}
		}}
	};
	let check = v.compile(schema);

	it("should give true if obj is valid", () => {
		let obj = {
			arr1: [
				[
					[ "apple", "peach" ],
					[ "pineapple", "plum" ]
				],
				[
					[ "orange", "lemon", "lime"]
				]
			]
		};

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give error 'not a string'", () => {
		let obj = {
			arr1: [
				[
					[ "apple", "peach" ],
					[ "pineapple", "plum" ]
				],
				[
					[ "orange", {}, "lime"]
				]
			]
		};

		let res = check(obj);

		expect(res.length).toBe(1);
		expect(res[0].type).toBe("string");
		expect(res[0].field).toBe("arr1[1][0][1]");
	});

});

describe("Test multiple rules", () => {
	const v = new Validator();

	let schema = {
		value: [
			{ type: "string", min: 3, max: 255 },
			{ type: "boolean" }
		]
	};

	let check = v.compile(schema);

	it("should give true if value is string", () => {
		let obj = { value: "John" };

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give true if value is boolean", () => {
		let obj = { value: true };
		let res = check(obj);
		expect(res).toBe(true);

		obj = { value: false };
		res = check(obj);
		expect(res).toBe(true);
	});

	it("should give error if the value is not string and not boolean", () => {
		let obj = { value: 100 };

		let res = check(obj);

		expect(res.length).toBe(2);
		expect(res[0].type).toBe("string");
		expect(res[0].field).toBe("value");

		expect(res[1].type).toBe("boolean");
		expect(res[1].field).toBe("value");
	});

	it("should give error if the value is a too short string", () => {
		let obj = { value: "Al" };
		let res = check(obj);

		expect(res.length).toBe(2);
		expect(res[0].type).toBe("stringMin");
		expect(res[0].field).toBe("value");

		expect(res[1].type).toBe("boolean");
		expect(res[1].field).toBe("value");

	});

	it("should work with optional", () => {

		let schemaOptional = {
			a: { type: "multi", optional: true, rules: [
				{ type: "number" },
				{ type: "string" },
			]}
		};

		let checkOptional = v.compile(schemaOptional);
		let res = checkOptional({});

		expect(res).toBe(true);
	});

	it("should work with optional (legacy)", () => {

		let schemaOptional = {
			a: [
				{ type: "number", optional: true },
				{ type: "string", optional: true },
			]
		};

		let checkOptional = v.compile(schemaOptional);

		expect(checkOptional({})).toBe(true);
		expect(checkOptional({ a: 5 })).toBe(true);
		expect(checkOptional({ a: "five" })).toBe(true);
		expect(checkOptional({ a: false })).toEqual([
			{ type: "number", field: "a", actual: false, message: "The 'a' field must be a number." },
			{ type: "string", field: "a", actual: false, message: "The 'a' field must be a string." },
		]);
	});

});

describe("Test multiple rules with objects", () => {
	const v = new Validator();

	let schema = {
		list: [
			{
				type: "object",
				props: {
					name: {type: "string"},
					age: {type: "number"},
				}
			},
			{
				type: "object",
				props: {
					country: {type: "string"},
					code: {type: "string"},
				}
			}
		]
	};

	let check = v.compile(schema);

	it("should give true if first object is given", () => {
		let obj = { list: {
			name: "Joe",
			age: 34
		} };

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give true if second object is given", () => {
		let obj = { list: {
			country: "germany",
			code: "de"
		}};

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give error if the object is broken", () => {
		let obj = { list: {
			name: "Average",
			age: "Joe"
		} };

		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(3);
		expect(res[0].type).toBe("number");
		expect(res[0].field).toBe("list.age");

		expect(res[1].type).toBe("required");
		expect(res[1].field).toBe("list.country");
	});

	it("should give error if the object is only partly given", () => {
		let obj = { list: {} };
		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(4);
		expect(res[0].type).toBe("required");
		expect(res[0].field).toBe("list.name");

		expect(res[1].type).toBe("required");
		expect(res[1].field).toBe("list.age");

	});

});

describe("Test multiple rules with objects within array", () => {
	const v = new Validator();

	let schema = {
		list: {
			type: "array",
			items: [
				{
					type: "object",
					properties: {
						name: {type: "string"},
						age: {type: "number"},
					}
				},
				{
					type: "object",
					properties: {
						country: {type: "string"},
						code: {type: "string"},
					}
				}
			]
		}
	};

	let check = v.compile(schema);

	it("should give true if one valid object is given", () => {
		let obj = { list: [
			{
				name: "Joe",
				age: 34
			}
		]};
		let res = check(obj);
		expect(res).toBe(true);

		let obj2 = { list: [
			{
				country: "germany",
				code: "de"
			}
		]};
		let res2 = check(obj2);
		expect(res2).toBe(true);
	});

	it("should give true if three valid objects given", () => {
		let obj = { list: [
			{
				name: "Joe",
				age: 34
			},
			{
				country: "germany",
				code: "de"
			},
			{
				country: "hungary",
				code: "hu"
			}
		]};
		let res = check(obj);
		expect(res).toBe(true);
	});

	it("should give error if one object is broken", () => {
		let obj = { list: [
			{
				name: "Joe",
				age: 34
			},
			{
				country: "germany",
			},
			{
				country: "hungary",
				code: "hu"
			}
		]};

		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(3);
		expect(res[0].type).toBe("required");
		expect(res[0].field).toBe("list[1].name");

		expect(res[1].type).toBe("required");
		expect(res[1].field).toBe("list[1].age");
	});

	it("should give error if one object is empty", () => {
		let obj = { list: [
			{
				name: "Joe",
				age: 34
			},
			{
				country: "hungary",
				code: "hu"
			},
			{
			}
		]};

		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(4);
		expect(res[0].type).toBe("required");
		expect(res[0].field).toBe("list[2].name");

		expect(res[1].type).toBe("required");
		expect(res[1].field).toBe("list[2].age");

	});

});

describe("Test multiple rules with mixed types", () => {
	const v = new Validator();

	let schema = {
		value: [
			{ type: "string", min: 3, max: 255 },
			{ type: "boolean" }
		]
	};

	let check = v.compile(schema);

	it("should give true if string", () => {
		expect(check({ value: "John" })).toBe(true);
	});

	it("should give true if boolean", () => {
		expect(check({ value: false })).toBe(true);
	});

	it("should give error if number", () => {
		const res = check({ value: 100 });

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(2);
		expect(res[0].type).toBe("string");
		expect(res[0].field).toBe("value");
		expect(res[1].type).toBe("boolean");
		expect(res[1].field).toBe("value");
	});

	it("should give error if 'undefined'", () => {
		const res = check({ value: undefined });

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(1);
		expect(res[0].type).toBe("required");
		expect(res[0].field).toBe("value");
	});

});

describe("Test multiple rules with arrays", () => {
	const v = new Validator();

	let schema = {
		list: [
			{
				type: "array",
				items: "string"
			},
			{
				type: "array",
				items: "number"
			}
		]
	};

	let check = v.compile(schema);

	it("should give true if first array is given", () => {
		let obj = { list: ["hello", "there", "this", "is", "a", "test"] };

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give true if second array is given", () => {
		let obj = { list: [1, 3, 3, 7] };

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give error if the array is broken", () => {
		let obj = { list: ["hello", 3] };

		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(2);
		expect(res[0].type).toBe("string");
		expect(res[0].field).toBe("list[1]");

		expect(res[1].type).toBe("number");
		expect(res[1].field).toBe("list[0]");
	});

	it("should give error if the array is broken", () => {
		let obj = { list: [true, false] };
		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(4);
		expect(res[0].type).toBe("string");
		expect(res[0].field).toBe("list[0]");

		expect(res[1].type).toBe("string");
		expect(res[1].field).toBe("list[1]");

	});

});

describe("Test multiple array in root", () => {
	const v = new Validator();

	let schema = [
		{
			type: "array",
			items: "string"
		},
		{
			type: "array",
			items: "number"
		}
	];

	let check = v.compile(schema);

	it("should give true if first array is given", () => {
		let obj = ["hello", "there", "this", "is", "a", "test"];

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give true if second array is given", () => {
		let obj = [1, 3, 3, 7];

		let res = check(obj);

		expect(res).toBe(true);
	});

	it("should give error if the array is broken", () => {
		let obj = ["hello", 3];

		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(2);
		expect(res[0].type).toBe("string");
		expect(res[0].field).toBe("[1]");

		expect(res[1].type).toBe("number");
		expect(res[1].field).toBe("[0]");
	});

	it("should give error if the array is broken", () => {
		let obj = [true, false];
		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(4);
		expect(res[0].type).toBe("string");
		expect(res[0].field).toBe("[0]");

		expect(res[1].type).toBe("string");
		expect(res[1].field).toBe("[1]");

	});

});

describe("Test object without props", () => {
	const v = new Validator();

	it("should compile and validate", () => {
		const schema = {
			valid: { type: "object" }
		};

		const check = v.compile(schema);
		expect(check).toBeInstanceOf(Function);

		const res = check({ valid: { a: "b" } });
		expect(res).toBe(true);
	});
});

describe("Test array without items", () => {
	const v = new Validator();

	it("should compile and validate", () => {
		const schema = {
			valid: { type: "array" }
		};

		const check = v.compile(schema);
		expect(check).toBeInstanceOf(Function);

		const res = check({ valid: [1, 2, 3] });
		expect(res).toBe(true);
	});
});

describe("Test recursive/cyclic schema", () => {
	const v = new Validator({ debug: false });

	let schema = {};
	Object.assign(schema, {
		name: { type: "string" },
		parent: { type: "object", properties: schema, optional: true },
		subcategories: {
			type: "array",
			optional: true,
			items: { type: "object", properties: schema}
		}
	});

	it("should compile and validate", () => {
		let category = {};
		Object.assign(category, {
			name: "top",
			subcategories: [
				{
					name: "sub1",
					parent: category
				},
				{
					name: "sub2",
					parent: category
				}
			]
		});

		const res = v.validate(category, schema);

		expect(res).toBe(true);
	});

	it("should give error if nested object is broken", () => {
		const category = {
			name: "top",
			subcategories: [
				{
					name: "sub1"
				},
				{
					name: "sub2",
					subcategories: [ {} ]
				}
			]
		};

		const res = v.validate(category, schema);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(1);
		expect(res[0].type).toBe("required");
		expect(res[0].field).toBe("subcategories[1].subcategories[0].name");
	});
});

describe("Test irregular object property names", () => {
	const v = new Validator();
	it("should compile schema with dash", () => {
		const schema = {
			"1-1": { type: "string" },
		};

		const res = v.validate({
			"1-1": "test",
		}, schema);
		expect(res).toBe(true);
	});

	it("should compile schema with quotes", () => {
		const schema = {
			"a'bc": { type: "string" },
			"a\"bc": { type: "string" },
		};

		const res = v.validate({ "a'bc": "test", "a\"bc": "test" }, schema);
		expect(res).toBe(true);
	});

	it("should compile schema with linebreak", () => {
		const schema = {
			"a\nbc\ndef": { type: "string" },
			"a\rbc": { type: "string" },
			"a\u2028bc": { type: "string" },
			"a\u2029bc": { type: "string" },
		};

		const res = v.validate({
			"a\nbc\ndef": "test",
			"a\rbc": "test",
			"a\u2028bc": "test",
			"a\u2029bc": "test",
		}, schema);
		expect(res).toBe(true);
	});

	it("should compile schema with escape characters", () => {
		const schema = {
			"\\o/": { type: "string" },
		};

		const res = v.validate({ "\\o/": "test" }, schema);
		expect(res).toBe(true);
	});

	it("should compile schema with reserved keyword", () => {
		// Reserved keywords are permitted as unquoted property names in ES5+. There is no special support for these
		const schema = {
			for: { type: "string" },
			goto: { type: "string" },
			var: { type: "string" },
			try: { type: "string" },
		};

		const res = v.validate({
			for: "hello",
			goto: "hello",
			var: "test",
			try: "test",
		}, schema);
		expect(res).toBe(true);
	});
});

describe("Test $$strict schema restriction on root-level", () => {
	const v = new Validator();

	let schema = {
		name: "string",
		$$strict: true
	};

	let check = v.compile(schema);

	it("should give error if the object contains additional properties on the root-level", () => {
		let obj = {
			name: "test",
			additionalProperty: "additional"
		};

		let res = check(obj);

		expect(res).toEqual([{
			"type": "objectStrict",
			"field": undefined,
			"actual": "additionalProperty",
			"expected": "name",
			"message": "The object '' contains forbidden keys: 'additionalProperty'.",
		}]);
	});
});

describe("Test $$strict schema restriction for nested objects", () => {
	const v = new Validator({ debug: false });

	let schema = {
		name: "string",
		object: {
			type: "object",
			props: {
				firstName: "string"
			}
		},
		$$strict: true
	};

	let check = v.compile(schema);

	it("should give error if the object contains additional properties on the root-level", () => {
		let obj = {
			name: "test",
			object: {
				firstName: "sub-test"
			},
			additionalProperty: "additional"
		};

		let res = check(obj);

		expect(res).toEqual([{
			"type": "objectStrict",
			"field": undefined,
			"actual": "additionalProperty",
			"expected": "name, object",
			"message": "The object '' contains forbidden keys: 'additionalProperty'.",
		}]);
	});
});

describe("Test strict schema restriction on sub-level", () => {
	const v = new Validator();

	let schema = {
		address: {
			type: "object",
			strict: true,
			props: {
				street: "string",
			}
		}
	};

	let check = v.compile(schema);

	it("should give error if the object contains additional properties on the sub-level", () => {
		let obj = {
			address: {
				street: "test",
				additionalProperty: "additional"
			}
		};

		let res = check(obj);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(1);
		expect(res[0].field).toBe("address");
		expect(res[0].type).toBe("objectStrict");
	});
});

describe("Test default value sanitizer", () => {
	const v = new Validator();

	it("should fill not defined properties with static value", () => {
		const schema = {
			id: { type: "number", default: 5 },
			name: { type: "string", default: "John" },
			age: { type: "number", optional: true, default: 33 },
			roles: { type: "array", items: "string", default: ["user"] },
			status: { type: "boolean", default: true },
			tuple: { type: "tuple", items: [{type: "number", default: 666}, {type: "string", default: "lucifer"}] },
			array: { type: "array", items: {type: "string", default: "bar"}},
		};
		const check = v.compile(schema);
		const obj = {
			name: null,
			status: false,
			tuple: [undefined, undefined],
			array: ["foo", undefined, "baz"]
		};

		const res = check(obj);

		expect(res).toBe(true);
		expect(obj).toEqual({
			id: 5,
			name: "John",
			age: 33,
			roles: ["user"],
			status: false,
			tuple: [666, "lucifer"],
			array: ["foo", "bar", "baz"]
		});
	});

	it("should fill not defined properties with dynamic value", () => {
		let number = { value: 0 };
		const check = v.compile({
			a: {
				type: "number",
				default: () => number.value++
			}
		});

		const o = {};

		expect(check(o)).toBe(true);
		expect(o.a).toBe(0);
		delete o.a;
		check(o);
		expect(o.a).toBe(1);
	});
});

describe("Test optional option", () => {
	const v = new Validator();

	it("should not throw error if value is undefined", () => {
		const schema = {
			foo: { type: "number", optional: true },
			array: { type: "array", optional: true, items: {type: "string", optional: true} },
			tuple: {
				type: "tuple",
				optional: true,
				items: [
					{ type: "number", optional: true },
				],
			},
		};
		const check = v.compile(schema);

		expect(check({})).toBe(true);
		expect(check({
			foo: undefined,
			array: [undefined],
			tuple: [undefined]
		})).toBe(true);
	});

	it("should not throw error if value is null", () => {
		const schema = { foo: { type: "number", optional: true } };
		const check = v.compile(schema);

		const o = { foo: null, array: [null], tuple: [null] };
		expect(check(o)).toBe(true);
		expect(o.foo).toBe(null);
	});

	it("should not throw error if value exist", () => {
		const schema = { foo: { type: "number", optional: true } };
		const check = v.compile(schema);

		expect(check({ foo: 2 })).toBe(true);
	});

	it("should set default value if there is a default", () => {
		const schema = {
			foo: { type: "number", optional: true, default: 5 },
			array: { type: "array", optional: true, items: {type: "string", optional: true, default: "foo"} },
			tuple: {
				type: "tuple",
				optional: true,
				items: [
					{ type: "number", optional: true, default: 666 },
				],
			},

		};
		const check = v.compile(schema);

		const o1 = { foo: 2, array: [], tuple: [6] };
		expect(check(o1)).toBe(true);
		expect(o1.foo).toBe(2);
		expect(o1.array).toStrictEqual([]);
		expect(o1.tuple).toStrictEqual([6]);

		const o2 = {array: [undefined], tuple: [undefined]};
		expect(check(o2)).toBe(true);
		expect(o2.foo).toBe(5);
		expect(o2.array).toStrictEqual(["foo"]);
		expect(o2.tuple).toStrictEqual([666]);
	});
});

describe("Test nullable option", () => {
	describe("old case", () => {
		const v = new Validator();

		it("should throw error if value is undefined", () => {
			const schema = { foo: { type: "number", nullable: true } };
			const check = v.compile(schema);

			expect(check(check)).toBeInstanceOf(Array);
			expect(check({ foo: undefined })).toBeInstanceOf(Array);
		});

		it("should not throw error if value is null", () => {
			const schema = { foo: { type: "number", nullable: true } };
			const check = v.compile(schema);

			const o = { foo: null };
			expect(check(o)).toBe(true);
			expect(o.foo).toBe(null);
		});

		it("should not throw error if value exist", () => {
			const schema = { foo: { type: "number", nullable: true } };
			const check = v.compile(schema);
			expect(check({ foo: 2 })).toBe(true);
		});

		it("should set default value if there is a default", () => {
			const schema = { foo: { type: "number", nullable: true, default: 5 } };
			const check = v.compile(schema);

			const o1 = { foo: 2 };
			expect(check(o1)).toBe(true);
			expect(o1.foo).toBe(2);

			const o2 = {};
			expect(check(o2)).toBe(true);
			expect(o2.foo).toBe(5);
		});

		it("should not set default value if current value is null", () => {
			const schema = { foo: { type: "number", nullable: true, default: 5 } };
			const check = v.compile(schema);

			const o = { foo: null };
			expect(check(o)).toBe(true);
			expect(o.foo).toBe(null);
		});

		it("should work with optional", () => {
			const schema = { foo: { type: "number", nullable: true, optional: true } };
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);
			expect(check({ foo: null })).toBe(true);
			expect(check({})).toBe(true);
		});

		it("should work with optional and default", () => {
			const schema = { foo: { type: "number", nullable: true, optional: true, default: 5 } };
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);

			const o1 = { foo: null };
			expect(check(o1)).toBe(true);
			expect(o1.foo).toBe(null);

			const o2 = {};
			expect(check(o2)).toBe(true);
			expect(o2.foo).toBe(5);
		});

		it("should accept null value when optional", () => {
			const schema = { foo: { type: "number", nullable: false, optional: true } };
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);
			expect(check({ foo: undefined })).toBe(true);
			expect(check({})).toBe(true);
			expect(check({ foo: null })).toBe(true);
		});

		it("should accept null as value when required", () => {
			const schema = {foo: {type: "number", nullable: true, optional: false}};
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);
			expect(check({ foo: undefined })).toEqual([{"actual": undefined, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
			expect(check({})).toEqual([{"actual": undefined, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
			expect(check({ foo: null })).toBe(true);
		});

		it("should not accept null as value when required and not explicitly not nullable", () => {
			const schema = {foo: {type: "number", optional: false}};
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);
			expect(check({ foo: undefined })).toEqual([{"actual": undefined, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
			expect(check({})).toEqual([{"actual": undefined, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
			expect(check({ foo: null })).toEqual([{"actual": null, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
		});
	});

	describe("new case (with considerNullAsAValue flag set to true)", () => {
		const v = new Validator({considerNullAsAValue: true});

		it("should throw error if value is undefined", () => {
			const schema = { foo: { type: "number" } };
			const check = v.compile(schema);

			expect(check(check)).toBeInstanceOf(Array);
			expect(check({ foo: undefined })).toBeInstanceOf(Array);
		});

		it("should not throw error if value is null", () => {
			const schema = { foo: { type: "number" } };
			const check = v.compile(schema);

			const o = { foo: null };
			expect(check(o)).toBe(true);
			expect(o.foo).toBe(null);
		});

		it("should not throw error if value exist", () => {
			const schema = { foo: { type: "number" } };
			const check = v.compile(schema);
			expect(check({ foo: 2 })).toBe(true);
		});

		it("should set default value if there is a default", () => {
			const schema = { foo: { type: "number", default: 5 } };
			const check = v.compile(schema);

			const o1 = { foo: 2 };
			expect(check(o1)).toBe(true);
			expect(o1.foo).toBe(2);

			const o2 = {};
			expect(check(o2)).toBe(true);
			expect(o2.foo).toBe(5);
		});

		it("should not set default value if current value is null", () => {
			const schema = { foo: { type: "number", default: 5 } };
			const check = v.compile(schema);

			const o = { foo: null };
			expect(check(o)).toBe(true);
			expect(o.foo).toBe(null);
		});

		it("should set default value if current value is null but can't be", () => {
			const schema = { foo: { type: "number", default: 5, nullable: false } };
			const check = v.compile(schema);

			const o = { foo: null };
			expect(check(o)).toBe(true);
			expect(o.foo).toBe(5);
		});

		it("should set default value if current value is null but optional", () => {
			const schema = { foo: { type: "number", default: 5, nullable: false, optional: true } };
			const check = v.compile(schema);

			const o = { foo: null };
			expect(check(o)).toBe(true);
			expect(o.foo).toBe(5);
		});

		it("should work with optional", () => {
			const schema = { foo: { type: "number", optional: true } };
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);
			expect(check({ foo: null })).toBe(true);
			expect(check({})).toBe(true);
		});

		it("should work with optional and default", () => {
			const schema = { foo: { type: "number", optional: true, default: 5 } };
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);

			const o1 = { foo: null };
			expect(check(o1)).toBe(true);
			expect(o1.foo).toBe(null);

			const o2 = {};
			expect(check(o2)).toBe(true);
			expect(o2.foo).toBe(5);
		});

		it("should not accept null value even if optional", () => {
			const schema = { foo: { type: "number", nullable: false, optional: true } };
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);
			expect(check({ foo: undefined })).toBe(true);
			expect(check({})).toBe(true);
			expect(check({ foo: null })).toEqual([{"actual": null, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
		});

		it("should not accept null as value", () => {
			const schema = {foo: {type: "number", nullable: false}};
			const check = v.compile(schema);

			expect(check({ foo: 3 })).toBe(true);
			expect(check({ foo: undefined })).toEqual([{"actual": undefined, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
			expect(check({})).toEqual([{"actual": undefined, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
			expect(check({ foo: null })).toEqual([{"actual": null, "field": "foo", "message": "The 'foo' field is required.", "type": "required"}]);
		});
	});
});

describe("Test async mode", () => {
	const v = new Validator({ useNewCustomCheckerFunction: true });

	// Async mode 1
	const custom1 = jest.fn(async value => {
		await new Promise(resolve => setTimeout(resolve, 100));
		return value.toUpperCase();
	});

	// Async mode 2
	const custom2 = jest.fn(async (value) => {
		await new Promise(resolve => setTimeout(resolve, 100));
		return value.trim();
	});

	// Async mode 3
	v.add("even", function({ messages }) {
		return {
			source: `
				if (value % 2 != 0)
					${this.makeError({ type: "evenNumber",  actual: "value", messages })}

				await new Promise(resolve => setTimeout(resolve, 100));

				return value;
			`
		};
	});
	v.addMessage("evenNumber", "The '{field}' field must be an even number! Actual: {actual}");

	const schema = {
		$$async: true,
		id: { type: "number", positive: true },
		name: { type: "string", custom: custom1 },
		username: {	type: "custom",	custom: custom2	},
		age: { type: "even" }
	};
	const check = v.compile(schema);

	it("should be async", () => {
		expect(check.async).toBe(true);
	});

	it("should call custom async validators", async () => {
		const obj = {
			id: 3,
			name: "John",
			username: "   john.doe  ",
			age: 30
		};

		const res = await check(obj);
		expect(res).toBe(true);

		expect(custom1).toBeCalledTimes(1);
		expect(custom1).toBeCalledWith("John", [], schema.name, "name", null, expect.anything());

		expect(custom2).toBeCalledTimes(1);
		expect(custom2).toBeCalledWith("   john.doe  ", [], schema.username, "username", null, expect.anything());
	});

	it("should give errors", async () => {
		const obj = {
			id: 3,
			name: "John",
			username: "   john.doe  ",
			age: 31
		};

		const res = await check(obj);

		expect(res.length).toBe(1);
		expect(res[0].type).toBe("evenNumber");
		expect(res[0].field).toBe("age");
		expect(res[0].actual).toBe(31);
		expect(res[0].expected).toBe(undefined);
	});

});

describe("Test context meta", () => {
	const v = new Validator({ useNewCustomCheckerFunction: true });

	const schema = {
		name: { type: "string", custom: (value, errors, schema, name, parent, context) => {
			expect(context.meta).toEqual({ a: "from-meta" });
			return context.meta.a;
		} },
	};
	const check = v.compile(schema);

	it("should call custom async validators", () => {
		const obj = {
			name: "John"
		};

		const res = check(obj, {
			meta: { a: "from-meta" }
		});

		expect(res).toBe(true);
		expect(obj).toEqual({ name: "from-meta" });
	});
});

describe("edge cases", () => {
	const v = new Validator({ useNewCustomCheckerFunction: true });

	it("issue #235 bug", () => {
		const schema = { name: { type: "string" } };
		const check = v.compile(schema);
		expect(check({ name: { toString: 1 } })).toEqual([
			{
				actual: { toString: 1 },
				field: "name",
				message: "The 'name' field must be a string.",
				type: "string",
			},
		]);
	});
});

describe("allow metas starting with $$", () => {
	const v = new Validator({ useNewCustomCheckerFunction: true });
	describe("test on schema", () => {
		it("should not remove keys from source object", async () => {
			const schema = {
				$$foo: {
					foo: "bar"
				},
				name: { type: "string" } };
			const clonedSchema = {...schema};
			v.compile(schema);

			expect(schema).toStrictEqual(clonedSchema);
		});

		it("should works with $$root", () => {
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

			expect(check("john.doe@company.net")).toEqual(true);
			expect(check("")).toEqual(true);
			expect(schema).toStrictEqual(clonedSchema);
		});

		it("should works with $$async", async () => {
			const custom1 = jest.fn().mockResolvedValue("NAME");
			const schema = {
				$$foo: {
					foo: "bar"
				},
				$$async: true,
				name: { type: "string", custom: custom1 },
			};
			const clonedSchema = {...schema};
			const check = v.compile(schema);

			//check schema meta was not changed
			expect(schema.$$foo).toStrictEqual(clonedSchema.$$foo);

			expect(check.async).toBe(true);

			let obj = {
				id: 3,
				name: "John",
				username: "   john.doe  ",
				age: 30
			};

			const res = await check(obj);
			expect(res).toBe(true);

			expect(custom1).toBeCalledTimes(1);
			expect(custom1).toBeCalledWith("John", [], schema.name, "name", null, expect.anything());
		});
	});

	describe("test on rule", () => {
		it("should not remove keys from source object", async () => {
			const schema = {
				name: {
					$$foo: {
						foo: "bar"
					},
					type: "string"
				}
			};
			const clonedSchema = {...schema};
			v.compile(schema);

			expect(schema).toStrictEqual(clonedSchema);
		});
		it("should works with $$type", async () => {
			const schema = {
				dot: {
					$$foo: {
						foo: "bar"
					},
					$$type: "object",
					x: "number",  // object props here
					y: "number",  // object props here
				}
			};
			const clonedSchema = {...schema};
			const check = v.compile(schema);

			expect(schema).toStrictEqual(clonedSchema);
			expect(check({
				x: 1,
				y: 1,
			})).toBeTruthy();
		});
	});
});
