"use strict";

const Validator = require("../lib/validator");

describe("Test constructor", () => {

	it("should create instance", () => {
		let v = new Validator();
		expect(v).toBeDefined();
		expect(v.messages).toBeDefined();
		expect(v.compile).toBeInstanceOf(Function);
		expect(v.validate).toBeInstanceOf(Function);
		expect(v.add).toBeInstanceOf(Function);

		expect(Object.keys(v.rules).length).toBe(14);
	});

	it("should create instance with custom messages", () => {
		let v = new Validator({
			messages: {
				numberMin: "Custom validation error message"
			}
		});
		expect(v).toBeDefined();
		expect(v.messages).toBeDefined();
		expect(v.messages.numberMin).toBe("Custom validation error message");
		expect(v.messages.numberMax).toBe("The '{field}' field must be less than or equal to {expected}!");
	});

	it("should create multi instance with custom messages", () => {
		let v1 = new Validator({
			messages: {
				numberMin: "Custom validation error message"
			}
		});
		let v2 = new Validator({
			messages: {
				numberMin: "Egyedi hibaüzenet"
			}
		});
		expect(v1).toBeDefined();
		expect(v1.messages).toBeDefined();
		expect(v1.messages.numberMin).toBe("Custom validation error message");
		expect(v1.messages.numberMax).toBe("The '{field}' field must be less than or equal to {expected}!");

		expect(v2).toBeDefined();
		expect(v2.messages).toBeDefined();
		expect(v2.messages.numberMin).toBe("Egyedi hibaüzenet");
		expect(v2.messages.numberMax).toBe("The '{field}' field must be less than or equal to {expected}!");
	});

});

describe("Test validate", () => {

	const v = new Validator();
	const compiledFn = jest.fn(() => true);
	v.compile = jest.fn(() => compiledFn);

	const schema = {
		name: { type: "string" }
	};

	const obj = {
		name: "John"
	};

	it("should call compile & compiled check function", () => {
		let res = v.validate(obj, schema);
		expect(res).toBe(true);
		expect(v.compile).toHaveBeenCalledTimes(1);
		expect(v.compile).toHaveBeenCalledWith(schema);

		expect(compiledFn).toHaveBeenCalledTimes(1);
		expect(compiledFn).toHaveBeenCalledWith(obj);
	});

});

describe("Test add", () => {

	const v = new Validator();
	const validFn = jest.fn(() => true);

	it("should not contain the new validator", () => {
		expect(v.rules.myValidator).toBeUndefined();
	});

	it("should contain the new validator", () => {
		v.add("myValidator", validFn);
		expect(v.rules.myValidator).toBeDefined();
	});

	it("should call the new validator", () => {
		const schema = {
			a: { type: "myValidator" }
		};

		const obj = { a: 5 };

		v.validate(obj, schema);

		expect(validFn).toHaveBeenCalledTimes(1);
		expect(validFn).toHaveBeenCalledWith(5, schema.a, "a", obj, undefined);
	});

});

describe("Test resolveMessage", () => {
	const v = new Validator();

	it("should resolve variables in message string", () => {
		let res = v.resolveMessage({ type: "stringLength", field: "age", expected: 3, actual: 6 }, v.messages["stringLength"] );
		expect(res).toBe("The 'age' field length must be 3 characters long!");
	});

	it("should resolve 0 value in message string", () => {
		let res = v.resolveMessage({ type: "numberNotEqual", field: "b", expected: 0, actual: 0 }, v.messages["numberNotEqual"] );
		expect(res).toBe("The 'b' field can't be equal with 0!");
	});

	it("should resolve more variables in message string", () => {
		v.messages.custom = "Field {field} and again {field}. Expected: {expected}, actual: {actual}.";
		let res = v.resolveMessage({ type: "custom", field: "country", expected: "London", actual: 350 },  v.messages.custom );
		expect(res).toBe("Field country and again country. Expected: London, actual: 350.");
	});

	it("should not resolve unknown errors", () => {
		let res = v.resolveMessage({ type: "XXX"});
		expect(res).toBeUndefined();
	});
});

describe("Test compile (unit test)", () => {

	const v = new Validator();
	v.compileSchemaRule = jest.fn(v.compileSchemaRule.bind(v));

	it("should call compileSchemaRule", () => {
		v.compile({
			id: { type: "number" },
			name: { type: "string", min: 5},
			status: "boolean"
		});

		expect(v.compileSchemaRule).toHaveBeenCalledTimes(3);
		expect(v.compileSchemaRule).toHaveBeenCalledWith({"type": "number"});
		expect(v.compileSchemaRule).toHaveBeenCalledWith({"type": "string", "min": 5});
		expect(v.compileSchemaRule).toHaveBeenCalledWith("boolean");
	});

	it("should call compileSchemaRule for root-level array", () => {
		v.compileSchemaRule.mockClear();

		v.compile([
			{ type: "array", items: "number" },
			{ type: "string", min: 2 }
		]);

		expect(v.compileSchemaRule).toHaveBeenCalledTimes(3);
		expect(v.compileSchemaRule).toHaveBeenCalledWith({"type": "array", items: "number"});
		expect(v.compileSchemaRule).toHaveBeenCalledWith("number");
		expect(v.compileSchemaRule).toHaveBeenCalledWith({"type": "string", min: 2 });
	});

	it("should throw error is the schema is null", () => {
		expect(() => {
			v.compile();
		}).toThrowError("Invalid schema!");

		expect(() => {
			v.compile(null);
		}).toThrowError("Invalid schema!");

		expect(() => {
			v.compile("Nothing");
		}).toThrowError("Invalid schema!");

		expect(() => {
			v.compile(1);
		}).toThrowError("Invalid schema!");
	});

	it("should throw error is the schema array element count is not 1", () => {
		expect(() => {
			v.compile([]);
		}).toThrowError();

		expect(() => {
			v.compile([], []);
		}).toThrowError();
	});

	it("should throw error if the type is invalid", () => {
		expect(() => {
			v.compile({ id: { type: "unknow" } });
		}).toThrowError("Invalid 'unknow' type in validator schema!");
	});

	it("should throw error if object has array props", () => {
		const schema = {
			invalid: { type: "object", props: [ { type: "string" }, { type: "number" } ] }
		};

		expect(() => {
			v.compile(schema);
		}).toThrowError();
	});

	it("should throw error if object has string props", () => {
		const schema = {
			invalid: { type: "object", props: "string" }
		};

		expect(() => {
			v.compile(schema);
		}).toThrowError();
	});
});

describe("Test compile (integration test)", () => {

	describe("Test check generator with good obj", () => {

		const v = new Validator();

		v.rules.string = jest.fn(() => true);
		v.rules.number = jest.fn(() => true);

		const schema = {
			id: { type: "number" },
			name: { type: "string" }
		};

		let check;

		it("should give a check function", () => {
			check = v.compile(schema);
			expect(check).toBeInstanceOf(Function);
		});

		it("should call rules validators", () => {
			const obj = { id: 5, name: "John" };
			const res = check(obj);
			expect(res).toBe(true);

			expect(v.rules.number).toHaveBeenCalledTimes(1);
			expect(v.rules.number).toHaveBeenCalledWith(5, schema.id, "id", obj, undefined);

			expect(v.rules.string).toHaveBeenCalledTimes(1);
			expect(v.rules.string).toHaveBeenCalledWith("John", schema.name, "name", obj, undefined);
		});

	});

	describe("Test check generator with shorthand schema", () => {

		const v = new Validator();

		v.rules.string = jest.fn(() => true);
		v.rules.number = jest.fn(() => true);

		const schema = {
			id: "number",
			name: "string"
		};

		let check;

		it("should give a check function", () => {
			check = v.compile(schema);
			expect(check).toBeInstanceOf(Function);
		});

		it("should call rules validators", () => {
			const obj = { id: 5, name: "John" };
			let res = check(obj);
			expect(res).toBe(true);

			expect(v.rules.number).toHaveBeenCalledTimes(1);
			expect(v.rules.number).toHaveBeenCalledWith(5, { type: "number" }, "id", obj, undefined);

			expect(v.rules.string).toHaveBeenCalledTimes(1);
			expect(v.rules.string).toHaveBeenCalledWith("John", { type: "string" }, "name", obj, undefined);
		});

	});

	describe("Test check generator with wrong obj", () => {

		const v = new Validator();

		const schema = {
			id: { type: "number" },
			name: { type: "string", min: 5, optional: true },
			password: { type: "forbidden" }
		};

		let check = v.compile(schema);

		it("should give back one errors", () => {
			let res = check({id: 5, name: "John" });
			expect(res).toBeInstanceOf(Array);

			expect(res.length).toBe(1);
			expect(res[0]).toEqual({
				type: "stringMin",
				field: "name",
				message: "The 'name' field length must be greater than or equal to 5 characters long!",
				expected: 5,
				actual: 4
			});
		});

		it("should give back more errors", () => {
			let res = check({ password: "123456" });
			expect(res).toBeInstanceOf(Array);

			expect(res.length).toBe(2);
			expect(res[0].type).toBe("required");
			expect(res[1].type).toBe("forbidden");
		});

	});

	describe("Test check generator with custom path & parent", () => {

		it("when schema is defined as an array, and custom path & parent are specified, they should be forwarded to validators", () => {
			const v = new Validator();
			const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
			v.add("customValidator", customValidator);

			const validate = v.compile([{ type: "customValidator" }]);
			const parent = {};
			const res = validate({ customValue: 4711 }, "customPath", parent);

			expect(res).toBe(true);
			expect(customValidator.mock.calls[0][2]).toBe("customPath");
			expect(customValidator.mock.calls[0][3]).toBe(parent);
		});

		it("when schema is defined as an array, path & parent should be set to default values in validators", () => {
			const v = new Validator();
			const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
			v.add("customValidator", customValidator);

			const validate = v.compile([{ type: "customValidator" }]);
			const res = validate({ customValue: 4711 });

			expect(res).toBe(true);
			expect(customValidator.mock.calls[0][2]).toBeUndefined();
			expect(customValidator.mock.calls[0][3]).toBeNull();
		});

		it("when schema is defined as an object, and custom path is specified, it should be forwarded to validators", () => {
			// Note: as the item we validate always must be an object, there is no use
			// of specifying a custom parent, like for the schema-as-array above.
			// The parent is currently used in the validator code (only forwarded to the generated
			// function that validates all properties) and there is no way to test it.
			const v = new Validator();
			const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
			v.add("customValidator", customValidator);

			const validate = v.compile({ customValue: { type: "customValidator" } });
			const res = validate({ customValue: 4711 }, "customPath");

			expect(res).toBe(true);
			expect(customValidator.mock.calls[0][2]).toBe("customPath.customValue");
		});

		it("when schema is defined as an object, path should be set to default value in validators", () => {
			const v = new Validator();
			const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
			v.add("customValidator", customValidator);

			const validate = v.compile({ customValue: { type: "customValidator" } });
			const res = validate({ customValue: 4711 });

			expect(res).toBe(true);
			expect(customValidator.mock.calls[0][2]).toBe("customValue");
		});
	});
});

describe("Test nested schema", () => {
	const v = new Validator();

	let schema = {
		id: { type: "number", positive: true },
		name: { type: "string" },
		address: { type: "object", props: {
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

	it("should give errors (flatten)", () => {
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
		a: { type: "object", props: {
			b: { type: "object", props: {
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
		expect(res[0].message).toBe("The 'a.b.c' field length must be greater than or equal to 5 characters long!");
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
			a: [
				{ type: "number", optional: true },
				{ type: "string", optional: true },
			]
		};

		let checkOptional = v.compile(schemaOptional);


		let obj = {};
		let res = checkOptional(obj);

		expect(res).toBe(true);
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
		debugger; // eslint-disable-line
		const res = check({ value: undefined });

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(2);
		expect(res[0].type).toBe("required");
		expect(res[0].field).toBe("value");
		expect(res[1].type).toBe("required");
		expect(res[1].field).toBe("value");
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
	const v = new Validator();

	let schema = {};
	Object.assign(schema, {
		name: { type: "string" },
		parent: { type: "object", props: schema, optional: true },
		subcategories: {
			type: "array",
			optional: true,
			items: { type: "object", props: schema}
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

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(1);
		expect(res[0].field).toBe("rootObject");
		expect(res[0].type).toBe("objectStrict");
	});
});

describe("Test $$strict schema restriction on sub-level", () => {
	const v = new Validator();

	let schema = {
		address: {
			type: "object",
			props: {
				street: "string",
				$$strict: true
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

describe("Test sanitizer", () => {
	const v = new Validator();

	it("should sanitize number", () => {
		const check = v.compile([{type: "number", convert: true}]);
		const converted = {};
		check("1", null, null, converted);
		expect(converted.value).toEqual(1);
	});

	it("should sanitize array of boolean", () => {
		const check = v.compile([{type: "array", items: { type: "boolean", convert: true} }]);
		const converted = {};
		check([ "on", "1", "true", "off", "0", "false" ], null, null, converted);
		expect(converted.value).toEqual([ true, true, true, false, false, false]);
	});

	it("should sanitize array without conversion", () => {
		const check = v.compile([{type: "array", items: { type: "string" } }]);
		const converted = {};
		check([ "string1", "string2" ], null, null, converted);
		expect(converted.value).toEqual([ "string1", "string2" ]);
	});

	it("should do nothing with string", () => {
		const check = v.compile(["string"]);
		const converted = {};
		check("1", null, null, converted);
		expect(converted.value).toEqual("1");
	});

	it("should do nothing with string in object", () => {
		const check = v.compile({ name: "string"});
		const converted = {};
		check({name: "1"}, null, null, converted);
		expect(converted.value).toEqual({name: "1"});
	});

	it("should not sanitize array with error", () => {
		const check = v.compile([{type: "array", items: { type: "boolean", convert: true} }]);
		const converted = {};
		const res = check(["false", 123], null, null, converted);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(1);
		expect(res[0].type).toBe("boolean");
		expect(res[0].field).toBe("[1]");

		expect(converted.value).not.toBeDefined();
	});

	it("should sanitize date", () => {
		const check = v.compile([{type: "date", convert: true}]);
		const converted = {};
		check("2018-01-30T22:00Z", null, null, converted);
		expect(converted.value).toEqual(new Date("2018-01-30T22:00Z"));
	});

	it("should sanitize optional and non-existent properties", () => {
		const check = v.compile({ id: { type: "number", optional: true }, name: { type: "string", optional: true } });
		const converted = {};
		check({id: undefined, name: null, removeme: "test" }, null, null, converted);
		expect(converted.value).toEqual({});
	});

	it("should sanitize complex object", () => {
		const schema = {};
		Object.assign(schema, {
			age: { type: "number", convert: true },
			date: { type: "date", convert: true },
			enabled: { type: "boolean", convert: true },
			node: { type: "array", optional: true, items: { type: "object", props: schema } }
		});

		const check = v.compile(schema);

		const date1Value = "2018-01-30T22:00Z";
		const date2Value = "2018-01-30Z";
		const date3Value = 10000000;
		const date4Value = "December 17, 1995 03:24:00";
		
		const date1 = new Date(date1Value);
		const date2 = new Date(date2Value);
		const date3 = new Date(date3Value);
		const date4 = new Date(date4Value);

		const result = {};
		const res = check({
			age: "14",
			date: date1Value,
			enabled: "true",
			node: [
				{
					age: "28",
					date: date2Value,
					enabled: "off",
					node: [
						{
							age: "42",
							date: date3Value,
							enabled: "1",
						},
						{
							age: "43",
							date: date4Value,
							enabled: "on",
						}
					]
				}
			]
		}, null, null, result);

		expect(res).toBe(true);
		expect(result.value).not.toBeNull();
		expect(result.value).toEqual({
			age: 14, 
			date: date1,
			enabled: true,
			node: [
				{
					age: 28,
					date: date2,
					enabled: false,
					node: [
						{
							age: 42,
							date: date3,
							enabled: true,
						},
						{
							age: 43,
							date: date4,
							enabled: true,
						}
					]
				}
			]});
	});
});
