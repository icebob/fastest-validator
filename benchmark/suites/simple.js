"use strict";

const Benchmarkify = require("benchmarkify");
const bench = new Benchmarkify({ async: false, name: "Simple object"});

const Validator = require("../../index");
const v = new Validator();

const obj = {
    name: "John Doe",
    email: "john.doe@company.space",
    firstName: "John",
    phone: "123-4567",
	age: 33
};

const wrongObj = {
    name: "John Doe",
    email: "john.doe@company.space",
    firstName: "John",
    phone: "123-4567",
	age: 5
};

const schema = {
	name: {
		type: "string",
		min: 4,
		max: 25
	},
	email: { type: "email" },
	firstName: { type: "string" },
	phone: { type: "string" },
	age: {
		type: "number",
		min: 18
	}
};

bench.skip("compile & validate", () => {
	let res = v.validate(obj, schema);		
	if (res !== true)
		throw new Error("Validation error!", res);
});


let check = v.compile(schema);

bench.add("validate with pre-compiled schema", () => {
	let res = check(obj);
	if (res !== true)
		throw new Error("Validation error!", res);
});

bench.add("validate with wrong obj", () => {
	let res = check(wrongObj);
	if (res === true)
		throw new Error("Validation error!", res);
});

bench.run();