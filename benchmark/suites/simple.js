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
	phone: { type: "string" },
	age: {
		type: "number",
		min: 18
	}
};

bench.ref("compile & validate", () => {
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


/*

===============================
  fastest-validator benchmark
===============================

Platform info:
==============
   Windows_NT 6.1.7601 x64
   Node.JS: 6.10.0
   V8: 5.1.281.93
   Intel(R) Core(TM) i7-4770K CPU @ 3.50GHz × 8

Suite: Simple object
√ compile & validate x 249,659 ops/sec ±0.17% (95 runs sampled)
√ validate with pre-compiled schema x 3,111,667 ops/sec ±0.92% (90 runs sampled)
√ validate with wrong obj x 767,201 ops/sec ±0.91% (92 runs sampled)

   compile & validate                  -91.98%    (249,659 ops/sec)
   validate with pre-compiled schema     0.00%   (3,111,667 ops/sec)
   validate with wrong obj             -75.34%    (767,201 ops/sec)
-----------------------------------------------------------------------

*/