"use strict";

const Validator = require("../../lib/validator");
const { generateSecurityTests } = require("./security-test-generator");

const v = new Validator();

function makeValidator(optionName, value) {
	const schema = { $$root: true, type: "string" };
	schema[optionName] = value;
	return v.compile(schema);
}

describe("Test helpers: security-test-generator", () => {
	// A regexp-typed option exercises the regexp fuzzer, and an unknown-typed
	// option exercises the fallback literal switches inside the generator.
	generateSecurityTests(
		{
			ruleName: "string.regexpPattern",
			options: {
				pattern: { type: "regexp" },
				someUnknownOption: { type: "someUnknownType" },
			},
		},
		makeValidator
	);

	// The `only` option limits processing to a subset of options.
	generateSecurityTests(
		{
			ruleName: "string.only",
			options: {
				contains: { type: "string" },
				min: { type: "number" },
			},
		},
		makeValidator,
		{ only: ["contains"] }
	);

	// skipWrongType skips the wrong-type test block for a real option.
	generateSecurityTests(
		{
			ruleName: "string.skipWrongType",
			options: {
				min: { type: "number" },
			},
		},
		makeValidator,
		{ skipWrongType: true }
	);

	// Skipping every option leaves nothing to test (early return).
	generateSecurityTests(
		{
			ruleName: "string.skipped",
			options: {
				min: { type: "number" },
			},
		},
		makeValidator,
		{ skip: ["min"] }
	);

	// A falsy option spec is skipped via the `if (!spec) return` branch.
	generateSecurityTests(
		{
			ruleName: "string.falsySpec",
			options: {
				max: { type: "number" },
				falsySpec: 0,
			},
		},
		makeValidator,
		{ only: ["max", "falsySpec"] }
	);
});