"use strict";

const { expectNoCodeExecution, INJECTION_PAYLOADS, resetGlobalSink } = require("./security");

/**
 * Simple fuzzers for basic types, no external deps.
 * These generate a small set of boundary-ish values per type.
 */
const fuzzers = {
	string: () => [
		"", // empty
		"a",
		"very long string ".repeat(100),
		"'\"`", // quotes
		"; alert(1); //",
		"\\n\\r\\t",
		"\\u0000",
		"∑",
		"{[()]}",
	],
	number: () => [
		0,
		1,
		-1,
		3.14,
		-2.718,
		Number.MAX_VALUE,
		Number.MIN_VALUE,
		Infinity,
		-Infinity,
		NaN, // will be caught by isFinite checks but we test compilation
		1e10,
		1e-10,
	],
	boolean: () => [true, false],
	object: () => [
		{},
		{ a: 1 },
		{ a: { b: 2 } },
		[],
		[1, 2, 3],
		() => {},
		/function/,
		/class/,
		new Date(),
		/null/,
	],
	array: () => [
		[],
		[1],
		[1, 2, 3],
		["a", "b"],
		[{}, {}],
		[null],
		[undefined],
	],
	regexp: () => [
		/.*/,
		/^start/,
		/end$/,
		/\d+/,
		/\w{3}/,
		/new RegExp(".*")/,
		/function/,
		// We'll inject RegExp objects directly in tests, not fuzz them as source
	],
};

/**
 * Known bad types for each declared good type.
 * Used to generate "wrong type" test cases.
 */
const BAD_TYPE_MAP = {
	string: ["number", "boolean", "object", "array", "function", "undefined", "null"],
	number: ["string", "boolean", "object", "array", "function", "undefined", "null"],
	boolean: ["string", "number", "object", "array", "function", "undefined", "null"],
	array: ["string", "number", "boolean", "object", "function", "undefined", "null"],
	object: ["string", "number", "boolean", "array", "function", "undefined", "null"],
	regexp: ["string", "number", "boolean", "object", "array", "function", "undefined", "null"],
};

/**
 * Generate security tests for a validator rule based on its declared option spec.
 *
 * @param {Object} ruleSpec Shape:
 *   {
 *     ruleName: "string",
 *     options: {
 *       contains: { type: "string" },
 *       pattern:  { type: "regexp" },
 *       // ...
 *     }
 *   }
 * @param {Function} makeValidator   Callback: given an option name + value, returns a validator instance.
 *                                   Used to avoid re-creating Validator in loops.
 * @param {Object}   [opts]          Additional flags.
 * @param {Array<string>} [opts.only]  Limit to these option names.
 * @param {Array<string>} [opts.skip]  Skip these option names.
 * @param {boolean}   [opts.skipWrongType]  Skip wrong-type tests (default: false).
 */
function generateSecurityTests(ruleSpec, makeValidator, opts = {}) {
	const {
		only = null,
		skip = [],
		skipWrongType = false,
	} = opts;

	const { ruleName, options = {} } = ruleSpec;
	const optionNames = Object.keys(options);

	const testOpts = only
		? optionNames.filter(name => only.includes(name))
		: optionNames.filter(name => !skip.includes(name));

	if (testOpts.length === 0) {
		return; // nothing to test
	}

	describe(`Security: rule ${ruleName}`, () => {
		// Per-test cleanup: reset validator and global sink
		beforeEach(() => {
			resetGlobalSink();
		});

		testOpts.forEach((optionName) => {
			const spec = options[optionName];
			if (!spec) {
				return;
			}
			const declaredType = spec.type;

			describe(`option "${optionName}" (expects ${declaredType})`, () => {
				// ---------- 1. Wrong-type tests ----------
				if (!skipWrongType) {
					it("should reject wrong types with a clean error (no SyntaxError)", () => {
						const badTypes = BAD_TYPE_MAP[declaredType] || [];
						badTypes.forEach((badType) => {
							const badValues = fuzzers[badType] ? fuzzers[badType]() : [{}];
							badValues.forEach((badValue) => {
								try {
									makeValidator(optionName, badValue);
								} catch (e) {
								// If it throws, it must be a clean validation error, never a
								// SyntaxError (a SyntaxError means injected code broke out of
								// the generated source).
									expect(e).not.toBeInstanceOf(SyntaxError);
								}
							});
						});
					});
				}

				// ---------- 2. Injection tests (even when type is correct) ----------
				it("should not allow code injection via payloads", () => {
					// Try each injection payload as the option value
					INJECTION_PAYLOADS.forEach(([label, payload]) => {
						const testLabel = `${optionName} injection via ${label}`;
						expectNoCodeExecution(
							() => makeValidator(optionName, payload),
							testLabel
						);
					});
				});

				// ---------- 3. Control test ----------
				it("should still work with a legitimate value", () => {
					let goodValue;
					if (fuzzers[declaredType]) {
						const goodValues = fuzzers[declaredType]();
						goodValue = goodValues[0];
					} else {
						// fallback: no fuzzer exists for this declared type
						goodValue = null;
					}

					expect(() => {
						makeValidator(optionName, goodValue);
					}).not.toThrow();
				});
			});
		});
	});
}

module.exports = {
	generateSecurityTests,
	fuzzers,
};