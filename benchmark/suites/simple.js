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

const schema3 = {
	name: {
		type: "string",
		min: 4,
		max: 25,
		trim: true
	},
	email: { type: "email" },
	firstName: { type: "string", trim: true },
	phone: { type: "string", trim: true },
	age: {
		type: "number",
		min: 18,
		convert: true
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
const check3 = v.compile(schema3);

bench.add("validate", () => {
	const res = check(obj);
	if (res !== true)
		throw new Error("Validation error!", res);
});

bench.add("validate with sanitizations", () => {
	const res = check3(obj);
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
   Windows_NT 10.0.18363 x64
   Node.JS: 12.14.1
   V8: 7.7.299.13-node.16
   Intel(R) Core(TM) i7-4770K CPU @ 3.50GHz × 8

Suite: Simple object
√ validate                            8,259,364 rps
√ validate with sanitizations         6,096,325 rps
√ validate with wrong obj             1,466,290 rps

   validate                               0%      (8,259,364 rps)   (avg: 121ns)
   validate with sanitizations       -26.19%      (6,096,325 rps)   (avg: 164ns)
   validate with wrong obj           -82.25%      (1,466,290 rps)   (avg: 681ns)
-----------------------------------------------------------------------

*/
