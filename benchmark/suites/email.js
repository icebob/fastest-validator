"use strict";

const Benchmarkify = require("benchmarkify");
const benchmark = new Benchmarkify("Fastest validator benchmark").printHeader();

let bench = benchmark.createSuite("Email validating methods");

const Validator = require("../../index");
const v = new Validator();

const obj = {
	email: "john.doe@company.space",
};

(function() {
	const schema = {
		email: { type: "email", mode: "precise" },
	};

	let check = v.compile(schema);

	bench.add("mode: 'precise'", () => {
		let res = check(obj);
		if (res !== true)
			throw new Error("Validation error!", res);
	});

})();

(function() {
	const schema = {
		email: { type: "email", mode: "basic" },
	};

	let check = v.compile(schema);

	bench.add("mode: 'basic'", () => {
		let res = check(obj);
		if (res !== true)
			throw new Error("Validation error!", res);
	});

})();


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

Suite: Email validating methods
√ mode: 'precise'         9,479,300 rps
√ mode: 'basic'          10,351,349 rps

   mode: 'precise'        -8.42%      (9,479,300 rps)   (avg: 105ns)
   mode: 'basic'              0%     (10,351,349 rps)   (avg: 96ns)
-----------------------------------------------------------------------

*/
