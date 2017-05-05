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

		expect(Object.keys(v.rules).length).toBe(11);
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

		v.validate({ a: 5 }, schema);

		expect(validFn).toHaveBeenCalledTimes(1);
		expect(validFn).toHaveBeenCalledWith(5, schema.a, "a");
	});

});

describe("Test resolveMessage", () => {
	const v = new Validator();

	it("should resolve variables in message string", () => {
		let res = v.resolveMessage({ type: "stringLength", field: "age", expected: 3, actual: 6 });
		expect(res).toBe("The 'age' field length must be 3 characters long!");
	});

	it("should resolve 0 value in message string", () => {
		let res = v.resolveMessage({ type: "numberNotEqual", field: "b", expected: 0, actual: 0 });
		expect(res).toBe("The 'b' field can't be equal with 0!");
	});

	it("should resolve more variables in message string", () => {
		v.messages.custom = "Field {field} and again {field}. Expected: {expected}, actual: {actual}.";
		let res = v.resolveMessage({ type: "custom", field: "country", expected: "London", actual: 350 });
		expect(res).toBe("Field country and again country. Expected: London, actual: 350.");
	});

});

describe("Test compile (unit test)", () => {

	const v = new Validator();
	v._processRule = jest.fn();

	it("should call processRule", () => {
		v.compile({
			id: { type: "number" },
			name: { type: "string", min: 5},
			status: "boolean"
		});

		expect(v._processRule).toHaveBeenCalledTimes(3);
		expect(v._processRule).toHaveBeenCalledWith({"type": "number"}, "id", false);
		expect(v._processRule).toHaveBeenCalledWith({"type": "string", "min": 5}, "name", false);
		expect(v._processRule).toHaveBeenCalledWith("boolean", "status", false);
	});

	it("should call processRule for root-level array", () => {
		v._processRule.mockClear();

		v.compile([{ type: "array", items: "number" }]);

		expect(v._processRule).toHaveBeenCalledTimes(1);
		expect(v._processRule).toHaveBeenCalledWith({"type": "array", items: "number"}, null, false);
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
});

describe("Test _processRule", () => {

	const v = new Validator();
	v.compile = jest.fn();
	v._checkWrapper = jest.fn();

	it("should return array of rules", () => {
		let res = v._processRule({ type: "number", positive: true }, "id", false);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(1);
		expect(res[0].fn).toBeInstanceOf(Function);
		expect(res[0].type).toBe("number");
		expect(res[0].name).toBe("id");
		expect(res[0].schema).toEqual({ type: "number", positive: true });
		expect(res[0].iterate).toBe(false);
	});

	it("should convert shorthand definition", () => {
		let res = v._processRule("string", "name", false);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(1);
		expect(res[0].fn).toBeInstanceOf(Function);
		expect(res[0].type).toBe("string");
		expect(res[0].name).toBe("name");
		expect(res[0].schema).toEqual({ type: "string" });
		expect(res[0].iterate).toBe(false);
	});

	it("should throw error if the type is invalid", () => {
		expect(() => {
			v._processRule({ type: "unknow" }, "id", false);
		}).toThrowError("Invalid 'unknow' type in validator schema!");
	});


	it("should call compile if type is object", () => {
		let res = v._processRule({ type: "object", props: {
			id: "number"
		} }, "item", false);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(2);
		expect(res[0].fn).toBeInstanceOf(Function);
		expect(res[0].type).toBe("object");
		expect(res[0].name).toBe("item");
		expect(res[0].iterate).toBe(false);

		//expect(res[1].fn).toBeInstanceOf(Function);
		expect(res[1].type).toBe("object");
		expect(res[1].name).toBe("item");
		expect(res[1].iterate).toBe(false);

		expect(v.compile).toHaveBeenCalledTimes(1);
		expect(v.compile).toHaveBeenCalledWith({id: "number"});		
	});

	it("should call checkWrapper & processRule if type is Array", () => {
		let res = v._processRule({ type: "array", items: "number" }, "list", false);

		expect(res).toBeInstanceOf(Array);
		expect(res.length).toBe(2);

		expect(res[0].fn).toBeInstanceOf(Function);
		expect(res[0].type).toBe("array");
		expect(res[0].name).toBe("list");
		expect(res[0].iterate).toBe(false);

		//expect(res[1].fn).toBeInstanceOf(Function);
		expect(res[1].type).toBe("array");
		expect(res[1].name).toBe("list");
		expect(res[1].iterate).toBe(true);

		expect(v._checkWrapper).toHaveBeenCalledTimes(1);
		expect(v._checkWrapper).toHaveBeenCalledWith([{"fn": expect.any(Function), "iterate": false, "name": null, "schema": {"type": "number"}, "type": "number"}]);		
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
			let res = check({id: 5, name: "John" });
			expect(res).toBe(true);

			expect(v.rules.number).toHaveBeenCalledTimes(1);
			expect(v.rules.number).toHaveBeenCalledWith(5, schema.id, "id");

			expect(v.rules.string).toHaveBeenCalledTimes(1);
			expect(v.rules.string).toHaveBeenCalledWith("John", schema.name, "name");
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
			let res = check({id: 5, name: "John" });
			expect(res).toBe(true);

			expect(v.rules.number).toHaveBeenCalledTimes(1);
			expect(v.rules.number).toHaveBeenCalledWith(5, { type: "number" }, "id");

			expect(v.rules.string).toHaveBeenCalledTimes(1);
			expect(v.rules.string).toHaveBeenCalledWith("John", { type: "string" }, "name");
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
				message: "The 'name' field length must be larger than or equal to 5 characters long!", 
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
		expect(res[0].message).toBe("The 'a.b.c' field length must be larger than or equal to 5 characters long!");
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

describe("Test root-level array", () => {
	const v = new Validator();

	let schema = [{ type: "array", items: { 
		type: "object", props: {
			id: "number",
			name: "string"
		}
	}}];

	let check = v.compile(schema);
	
	it("should give true if obj is valid", () => {
		let obj = [	
			{ id: 1, name: "John" },
			{ id: 2, name: "Jane" },
			{ id: 3, name: "James" }
		];

		let res = check(obj);

		expect(res).toBe(true);
	});
	
	it("should give error if an element is not object", () => {
		let obj = [	
			{ id: 1, name: "John" },
			{ id: 2, name: "Jane" },
			123
		];

		let res = check(obj);
		
		expect(res.length).toBe(3);
		expect(res[0].type).toBe("object");
		expect(res[0].field).toBe("[2]");

	});
	
	it("should give error if an element is not object", () => {
		let obj = [	
			{ id: 1, name: "John" },
			{ id: 2, _name: "Jane" }
		];

		let res = check(obj);
		
		expect(res.length).toBe(1);
		expect(res[0].type).toBe("required");
		expect(res[0].field).toBe("[1].name");

	});

});