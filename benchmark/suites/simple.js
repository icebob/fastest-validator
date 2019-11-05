"use strict";

const Benchmarkify = require("benchmarkify");
const benchmark = new Benchmarkify("Fastest validator benchmark").printHeader();

let bench = benchmark.createSuite("Simple object");

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
	phone: { type: "string"},
	age: {
		type: "number",
		min: 18
	}
};

const schema2 = {
	name: {
		type: "string",
		min: 4,
		max: 25,
		messages: {
			string: "Csak szöveges érték",
			stringMin: "Túl rövid!",
			stringMax: "Túl hosszú"
		}
	},
	email: { type: "email" },
	firstName: { type: "string" },
	phone: { type: "string"},
	age: {
		type: "number",
		min: 18
	}
};
/*
bench.ref("compile & validate", () => {
	const res = v.validate(obj, schema);
	if (res !== true)
		throw new Error("Validation error!", res);
});

bench.add("compile & validate with custom messages", () => {
	const res = v.validate(obj, schema2);
	if (res !== true)
		throw new Error("Validation error!", res);
});
*/
const check = v.compile(schema);

bench.add("validate", () => {
	const res = check(obj);
	if (res !== true)
		throw new Error("Validation error!", res);
});

bench.add("validate with wrong obj", () => {
	const res = check(wrongObj);
	if (res === true)
		throw new Error("Validation error!", res);
});

bench.run();


/*

===============================
  Fastest validator benchmark
===============================

Platform info:
==============
   Windows_NT 6.1.7601 x64
   Node.JS: 8.11.0
   V8: 6.2.414.50
   Intel(R) Core(TM) i7-4770K CPU @ 3.50GHz × 8

Suite: Simple object
√ compile & validate                        1,115,239 rps
√ validate with pre-compiled schema         3,986,017 rps
√ validate with wrong obj                     704,992 rps

   compile & validate (#)                       0%      (1,115,239 rps)   (avg: 896ns)
   validate with pre-compiled schema      +257.41%      (3,986,017 rps)   (avg: 250ns)
   validate with wrong obj                 -36.79%        (704,992 rps)   (avg: 1μs)
-----------------------------------------------------------------------

*/
