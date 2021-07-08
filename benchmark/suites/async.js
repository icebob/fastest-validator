"use strict";

const Benchmarkify = require("benchmarkify");
const benchmark = new Benchmarkify("Fastest validator benchmark").printHeader();

let bench = benchmark.createSuite("Simple object");

const Validator = require("../../index");
const v = new Validator({ async: true });

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

bench.add("validate", async done => {
	const res = await check(obj);
	if (res !== true)
		throw new Error("Validation error!", res);
	done();
});

bench.add("validate with sanitizations", async done => {
	const res = await check3(obj);
	if (res !== true)
		throw new Error("Validation error!", res);
	done();
});

bench.add("validate with wrong obj", async done => {
	const res = check(wrongObj);
	if (res === true)
		throw new Error("Validation error!", res);
	done();
});

bench.run();


/*

===============================
  Fastest validator benchmark
===============================

Platform info:
==============
   Windows_NT 10.0.19041 x64
   Node.JS: 12.14.1
   V8: 7.7.299.13-node.16
   Intel(R) Core(TM) i7-4770K CPU @ 3.50GHz × 8

Suite: Simple object
√ validate*                           1,220,837 rps
√ validate with sanitizations*        1,077,153 rps
√ validate with wrong obj*              679,003 rps

   validate*                              0%      (1,220,837 rps)   (avg: 819ns)
   validate with sanitizations*      -11.77%      (1,077,153 rps)   (avg: 928ns)
   validate with wrong obj*          -44.38%        (679,003 rps)   (avg: 1μs)
-----------------------------------------------------------------------


*/
