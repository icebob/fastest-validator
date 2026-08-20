"use strict";

const Benchmarkify = require("benchmarkify");
const fs = require("fs");
const benchmark = new Benchmarkify("Fastest validator benchmark (matrix)").printHeader();


const Validator = require("../../index");
const { ObjectId } = require("mongodb");

// Per-rule benchmark configuration: a factory producing a fresh schema, plus a
// "good" value that must validate successfully. Single-rule schemas are wrapped
// with `$$root` so they compile as a top-level rule; framed rules (objectID)
// keep their nested field shape.
const RULES = [
	{ name: "any", schema: () => ({ type: "any" }), value: 123 },
	{ name: "array", schema: () => ({ type: "array", items: { type: "number" } }), value: [1, 2, 3] },
	{ name: "boolean", schema: () => ({ type: "boolean" }), value: true },
	{ name: "class", schema: () => ({ type: "class", instanceOf: Date }), value: new Date() },
	{ name: "currency", schema: () => ({ type: "currency", currencySymbol: "$" }), value: "$123.45" },
	{ name: "custom", schema: () => ({ type: "custom", check: v => v }), value: 5 },
	{ name: "date", schema: () => ({ type: "date" }), value: new Date() },
	{ name: "email", schema: () => ({ type: "email" }), value: "john@doe.com" },
	{ name: "enum", schema: () => ({ type: "enum", values: ["a", "b"] }), value: "a" },
	{ name: "equal", schema: () => ({ type: "equal", value: 42 }), value: 42 },
	{ name: "forbidden", schema: () => ({ type: "forbidden" }), value: null },
	{ name: "function", schema: () => ({ type: "function" }), value: function () {} },
	{ name: "luhn", schema: () => ({ type: "luhn" }), value: "79927398713" },
	{ name: "mac", schema: () => ({ type: "mac" }), value: "00:11:22:33:44:55" },
	{ name: "multi", schema: () => ({ type: "multi", rules: [{ type: "number" }] }), value: 5 },
	{ name: "number", schema: () => ({ type: "number" }), value: 42 },
	{ name: "object", schema: () => ({ type: "object" }), value: { a: 1 } },
	{ name: "objectID", schema: () => ({ id: { type: "objectID", ObjectID: ObjectId } }), frame: "id", value: new ObjectId() },
	{ name: "pipe", schema: () => ({ type: "pipe", steps: [{ type: "number" }] }), value: 5 },
	{ name: "record", schema: () => ({ type: "record", key: { type: "string" }, value: { type: "number" } }), value: { a: 1 } },
	{ name: "string", schema: () => ({ type: "string" }), value: "hello" },
	{ name: "tuple", schema: () => ({ type: "tuple", items: [{ type: "string" }, { type: "number" }] }), value: ["a", 42] },
	{ name: "url", schema: () => ({ type: "url" }), value: "https://example.com" },
	{ name: "uuid", schema: () => ({ type: "uuid" }), value: "550e8400-e29b-41d4-a716-446655440000" }
];

// Build the compile schema and validate value for a rule.
function caseOf(cfg) {
	const schema = cfg.schema();
	return cfg.frame
		? { schema, value: { [cfg.frame]: cfg.value } }
		: { schema: { $$root: true, ...schema }, value: cfg.value };
}

// 69 cases totalling well beyond the default 5s/case -> cap sampling time so the
// full matrix stays practical to run end-to-end.
let bench = benchmark.createSuite("Rule matrix (compile + validate)", { time: 500 });

for (const cfg of RULES) {
	// compile-time (build) cost per rule
	bench.add("compile " + cfg.name, () => {
		new Validator().compile(caseOf(cfg).schema);
	});

	// validate (sync) cost per rule
	{
		const { schema, value } = caseOf(cfg);
		const check = new Validator().compile(schema);
		bench.add("validate " + cfg.name, () => {
			const res = check(value);
			if (res !== true) throw new Error("Validation error!", res);
		});
	}

	// validate (async) cost per rule
	{
		const { schema, value } = caseOf(cfg);
		const check = new Validator({ async: true }).compile(schema);
		bench.add("validate* " + cfg.name, async done => {
			const res = await check(value);
			if (res !== true) throw new Error("Validation error!", res);
			done();
		});
	}
}

bench.run();
