"use strict";

// Regression tests tied to GitHub issues (icebob/fastest-validator), grouped by
// issue id. These cover both security concerns (code injection through schema
// options) and correctness of quote/pattern/type handling.

const Validator = require("../lib/validator");
const {
	INJECTION_PAYLOADS,
	expectNoCodeExecution,
	resetGlobalSink,
} = require("./helpers/security");
const {
	escapeRegExp,
	toRegExp,
} = require("../lib/helpers/schema-options");

const v = new Validator();

describe("GitHub issues: security & robustness regressions", () => {
	beforeEach(() => {
		resetGlobalSink();
	});

	// ---------------------------------------------------------------------
	// Helpers (compilation/validation assertions)
	// ---------------------------------------------------------------------
	function rootSchema(ruleOptions) {
		return Object.assign({ $$root: true }, ruleOptions);
	}
	function compileRoot(schema) {
		return new Validator().compile(schema);
	}

	// Numeric / boolean options are REJECTED at compile time. A hostile
	// non-conforming value must throw a plain Error (never a SyntaxError, never
	// running code).
	function assertRejectedAtCompile(ruleOptions, contextLabel) {
		INJECTION_PAYLOADS.forEach(([label, payload]) => {
			const schema = rootSchema(Object.assign({}, ruleOptions.value, { [ruleOptions.name]: payload }));
			const res = expectNoCodeExecution(() => compileRoot(schema), `${contextLabel} via ${label}`);
			expect(res.threw).toBe(true);
			expect(res.error).toBeInstanceOf(Error);
			expect(res.error).not.toBeInstanceOf(SyntaxError);
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});
	}

	// String options that are safely quoted: compile fine and never execute code.
	function assertSafelyQuoted(ruleOptions, contextLabel) {
		INJECTION_PAYLOADS.forEach(([label, payload]) => {
			const schema = rootSchema(Object.assign({}, ruleOptions.value, { [ruleOptions.name]: payload }));
			expect(() => compileRoot(schema)).not.toThrow();
			const res = expectNoCodeExecution(() => compileRoot(schema), `${contextLabel} via ${label}`);
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});
	}

	// Array-of-strings options safely JSON-escaped (e.g. enum values).
	function assertArraySafelyQuoted(ruleOptions, arrayLength, contextLabel) {
		INJECTION_PAYLOADS.forEach(([label, payload]) => {
			const values = [];
			for (let i = 0; i < arrayLength; i++) values.push(i === 0 ? payload : "safe");
			const schema = rootSchema(Object.assign({}, ruleOptions.value, { [ruleOptions.name]: values }));
			expect(() => compileRoot(schema)).not.toThrow();
			const res = expectNoCodeExecution(() => compileRoot(schema), `${contextLabel} via ${label}`);
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});
	}

	// =====================================================================
	// Issue #326 — Risk of remote code execution for untrusted schemas
	// =====================================================================
	describe("Issue #326: RCE via untrusted schema options", () => {
		describe("number rule numeric options are rejected at compile time", () => {
			["max", "min", "step", "equal", "notEqual"].forEach((opt) => {
				it(`rejects a hostile non-numeric ${opt} without executing code`, () => {
					assertRejectedAtCompile({ name: opt, value: { type: "number" } }, `number.${opt}`);
				});
			});

			["integer", "positive"].forEach((opt) => {
				it(`rejects a hostile non-boolean ${opt} without executing code`, () => {
					assertRejectedAtCompile({ name: opt, value: { type: "number" } }, `number.${opt}`);
				});
			});
		});

		describe("string rule options", () => {
			it("safely quotes a hostile contains value", () => {
				assertSafelyQuoted({ name: "contains", value: { type: "string" } }, "string.contains");
			});

			it("safely handles a hostile pattern value (toRegExp) without executing code", () => {
				INJECTION_PAYLOADS.forEach(([label, payload]) => {
					const schema = rootSchema({ type: "string", pattern: payload });
					const res = expectNoCodeExecution(() => compileRoot(schema), `string.pattern via ${label}`);
					expect(res.executed).toBe(false);
					expect(res.consoleCalls).toBe(0);
					if (res.threw) expect(res.error).not.toBeInstanceOf(SyntaxError);
				});
			});

			it("rejects a hostile non-numeric min without executing code", () => {
				assertRejectedAtCompile({ name: "min", value: { type: "string" } }, "string.min");
			});

			it("rejects a hostile non-numeric max without executing code", () => {
				assertRejectedAtCompile({ name: "max", value: { type: "string" } }, "string.max");
			});

			it("safely JSON-escapes a hostile string.enum array", () => {
				assertArraySafelyQuoted({ name: "enum", value: { type: "string" } }, 1, "string.enum");
			});

			it("safely quotes a hostile padChar value", () => {
				assertSafelyQuoted({ name: "padChar", value: { type: "string", padStart: 4 } }, "string.padChar");
			});
		});

		describe("enum rule", () => {
			it("safely JSON-escapes hostile enum.values", () => {
				assertArraySafelyQuoted({ name: "values", value: { type: "enum" } }, 1, "enum.values");
			});

			it("rejects a hostile non-array values without executing code", () => {
				assertRejectedAtCompile({ name: "values", value: { type: "enum" } }, "enum.values");
			});
		});

		describe("url rule", () => {
			it("rejects a hostile non-boolean empty without executing code", () => {
				assertRejectedAtCompile({ name: "empty", value: { type: "url" } }, "url.empty");
			});
		});

		describe("email rule", () => {
			it("rejects a hostile non-numeric min without executing code", () => {
				assertRejectedAtCompile({ name: "min", value: { type: "email" } }, "email.min");
			});

			it("rejects a hostile non-numeric max without executing code", () => {
				assertRejectedAtCompile({ name: "max", value: { type: "email" } }, "email.max");
			});

			it("safely handles a hostile mode value (never interpolated into source)", () => {
				INJECTION_PAYLOADS.forEach(([label, payload]) => {
					const schema = rootSchema({ type: "email", mode: payload });
					expect(() => compileRoot(schema)).not.toThrow();
					const res = expectNoCodeExecution(() => compileRoot(schema), `email.mode via ${label}`);
					expect(res.threw).toBe(false);
					expect(res.executed).toBe(false);
					expect(res.consoleCalls).toBe(0);
				});
			});
		});

		describe("currency rule", () => {
			["currencySymbol", "thousandSeparator", "decimalSeparator"].forEach((opt) => {
				it(`safely escapes a hostile ${opt} without executing code`, () => {
					assertSafelyQuoted({ name: opt, value: { type: "currency" } }, `currency.${opt}`);
				});
			});
		});
	});

	// =====================================================================
	// Issue #242 — Error object includes expected regex pattern (info leak / safe representation)
	// =====================================================================
	describe("Issue #242: error never leaks or executes the hostile expected pattern", () => {
		const REGEX_PAYLOADS = [
			["slash paren", ".*); global.__FV_INJECTED__.fired = true; //"],
			["semicolon", "; global.__FV_INJECTED__.fired = true; //"],
			["lookahead", "(?=.*)); global.__FV_INJECTED__.fired = true; //"],
			["double quote", "\"); global.__FV_INJECTED__.fired = true; //"],
			["newline", "\n; global.__FV_INJECTED__.fired = true; //"],
			["template literal", "${global.__FV_INJECTED__.fired = true}"],
		];

		it.each(REGEX_PAYLOADS)(
			"does not execute code or emit a SyntaxError for payload: %s",
			(label, payload) => {
				const res = expectNoCodeExecution(() => {
					v.compile({ $$root: true, type: "string", pattern: payload });
				}, `pattern payload: ${label}`);
				if (res.threw) {
					expect(res.error).toBeInstanceOf(Error);
					expect(res.error).not.toBeInstanceOf(SyntaxError);
				}
			}
		);

		it("registers an execution sink marker if code ever does run", () => {
			expect(global.__FV_INJECTED__).toBeDefined();
		});

		it.each([
			["double quote alt", "\"; global.__FV_INJECTED__.fired = true; //"],
			["semicolon", "; global.__FV_INJECTED__.fired = true; //"],
			["comment + code", "// global.__FV_INJECTED__.fired = true"],
		])(
			"a failing validation with payload %s returns a safe error, no execution or SyntaxError",
			(label, payload) => {
				let check;
				expectNoCodeExecution(() => {
					check = v.compile({ $$root: true, type: "string", pattern: payload });
				}, `compile payload: ${label}`);

				let result;
				expectNoCodeExecution(() => {
					result = check("ABCVALUE");
				}, `validate payload: ${label}`);

				expect(Array.isArray(result)).toBe(true);
				expect(result).toHaveLength(1);
				expect(result[0].type).toBe("stringPattern");

				const expected = result[0].expected;
				expect(typeof expected).toBe("string");
				// The expected pattern is an escaped regex literal (`/.../`), never
				// the raw payload re-embedded as code.
				expect(expected).toMatch(/^\/.*\/$/);
				expect(expected).not.toBe(payload);
				expect(expected).not.toContain(`${payload}`);
			}
		);
	});

	// =====================================================================
	// Issue #246 — Regex pattern escape not shown in error after validation
	// =====================================================================
	describe("Issue #246: pattern still validates & escape is preserved in errors", () => {
		it("a valid anchored pattern matches and rejects with the escaped literal", () => {
			const check = v.compile({ $$root: true, type: "string", pattern: "^\\d+$" });
			expect(check("12345")).toEqual(true);
			expect(check("12a45")).toEqual([
				{ type: "stringPattern", expected: "/^\\d+$/", actual: "12a45", message: "The '' field fails to match the required pattern." },
			]);
		});

		it("patternFlags are applied", () => {
			const check = v.compile({ $$root: true, type: "string", pattern: "^abc$", patternFlags: "i" });
			expect(check("ABC")).toEqual(true);
			expect(check("xyz")).toEqual([
				{ type: "stringPattern", expected: "/^abc$/i", actual: "xyz", message: "The '' field fails to match the required pattern." },
			]);
		});
	});

	// =====================================================================
	// Issue #293 — Compilation impossible with enum value containing quotes
	// =====================================================================
	describe("Issue #293: enum values containing quotes compile & validate safely", () => {
		const QUOTED = ["a\"b", "c'd", "\""];

		it("compiles enum values containing double quotes, single quotes and bare quotes", () => {
			expect(() => v.compile({ $$root: true, type: "enum", values: QUOTED })).not.toThrow();
		});

		it("validates matching quote-containing values", () => {
			const check = v.compile({ $$root: true, type: "enum", values: QUOTED });
			expect(check("a\"b")).toBe(true);
			expect(check("c'd")).toBe(true);
			expect(check("\"")).toBe(true);
		});

		it("rejects non-members without leaking raw quotes into the error payload", () => {
			const check = v.compile({ $$root: true, type: "enum", values: QUOTED });
			const err = check("z");
			expect(Array.isArray(err)).toBe(true);
			expect(err[0].type).toBe("enumValue");
			expect(err[0].expected).toBe("a\"b, c'd, \"");
			expect(err[0].actual).toBe("z");
		});

		it("does not execute for hostile enum values (injection battery)", () => {
			INJECTION_PAYLOADS.forEach(([label, payload]) => {
				const res = expectNoCodeExecution(
					() => v.compile({ $$root: true, type: "enum", values: [payload] }),
					`enum ${label}`
				);
				expect(res.threw).toBe(false);
				expect(res.executed).toBe(false);
			});
		});

		it("still accepts a hostile double-quote payload as a legitimate literal member", () => {
			const payload = "\"); global.__FV_INJECTED__.fired = true; //";
			const check = v.compile({ $$root: true, type: "enum", values: [payload] });
			expect(check(payload)).toBe(true);
		});

		it("does not execute for a backtick + template-literal payload", () => {
			const payload = "`); global.__FV_INJECTED__.fired = true; //`";
			expectNoCodeExecution(() => v.compile({ $$root: true, type: "enum", values: [payload] }), "enum backtick payload");
		});

		it("does not execute for a ${} template-expression payload", () => {
			const payload = "${global.__FV_INJECTED__.fired = true}";
			expectNoCodeExecution(() => v.compile({ $$root: true, type: "enum", values: [payload] }), "enum template-literal payload");
		});
	});

	// =====================================================================
	// Issue #311 — Enum shorthand + wrong enum error message
	// =====================================================================
	describe("Issue #311: enum error message correctness (incl. string.enum shorthand)", () => {
		it("returns a proper error array with type 'enumValue' for non-members", () => {
			const check = v.compile({ $$root: true, type: "enum", values: ["male", "female"] });
			const err = check("alien");
			expect(Array.isArray(err)).toBe(true);
			expect(err[0]).toMatchObject({ type: "enumValue", actual: "alien" });
		});

		it("reports the allowed values list in expected, not raw injected source", () => {
			const check = v.compile({ $$root: true, type: "enum", values: ["male", "female"] });
			const err = check("alien");
			expect(err[0].expected).toBe("male, female");
		});

		it("produces a message that quotes the allowed values, not raw injected code", () => {
			const check = v.compile({ $$root: true, type: "enum", values: ["male", "female"] });
			const err = check("alien");
			expect(err[0].message).toContain("'male, female'");
			expect(err[0].message).not.toContain("__FV_INJECTED__");
		});

		it("string.enum shorthand validates members and rejects non-members", () => {
			const check = v.compile({ $$root: true, type: "string", enum: ["a", "b"] });
			expect(check("a")).toBe(true);
			expect(check("b")).toBe(true);
			const err = check("z");
			expect(Array.isArray(err)).toBe(true);
			expect(err[0].type).toBe("stringEnum");
			expect(err[0].expected).toBe("a, b");
		});

		it("string.enum shorthand safely handles quote-containing members", () => {
			const check = v.compile({ $$root: true, type: "string", enum: ["a\"b", "c'd"] });
			expect(check("a\"b")).toBe(true);
			expect(check("c'd")).toBe(true);
			const err = check("z");
			expect(err[0].type).toBe("stringEnum");
			expect(err[0].expected).toBe("a\"b, c'd");
		});

		it("string.enum shorthand does not execute hostile payloads", () => {
			const payloads = [
				["double quote", "\"); global.__FV_INJECTED__.fired = true; //"],
				["backtick", "`); global.__FV_INJECTED__.fired = true; //`"],
				["template literal", "${global.__FV_INJECTED__.fired = true}"],
			];
			payloads.forEach(([label, payload]) => {
				const res = expectNoCodeExecution(
					() => v.compile({ $$root: true, type: "string", enum: [payload] }),
					`string.enum ${label}`
				);
				expect(res.threw).toBe(false);
				expect(res.executed).toBe(false);
			});
		});
	});

	// =====================================================================
	// Issue #348 — type & $$type ambiguity (crash on enum)
	// =====================================================================
	describe("Issue #348: type vs $$type ambiguity must not crash", () => {
		it("validates enum members using the documented 'type' key", () => {
			const check = v.compile({ $$root: true, type: "enum", values: ["a", "b"] });
			expect(check("a")).toBe(true);
			expect(check("b")).toBe(true);
			expect(check("z")).toEqual([
				{ type: "enumValue", expected: "a, b", actual: "z", message: "The '' field value 'a, b' does not match any of the allowed values." },
			]);
		});

		it("does not crash (no SyntaxError) when '$$type' is used for an enum", () => {
			expectNoCodeExecution(
				() => v.compile({ $$root: true, $$type: "enum", values: ["a", "b"] }),
				"$$type enum"
			);
		});

		it("compiles an unknown type to a normal Error, not a syntax/crash error", () => {
			expect(() => v.compile({ $$root: true, $$type: "not-a-real-type", values: ["a"] }))
				.toThrow(/Invalid '.*' type in validator schema/);
		});
	});

	// =====================================================================
	// schema-options helpers: escapeRegExp / toRegExp (support #242/#246)
	// =====================================================================
	describe("schema-options helpers: escapeRegExp / toRegExp", () => {
		it("escapeRegExp escapes regex metacharacters", () => {
			expect(escapeRegExp("a.b*c?d+e(f)[g]{h}|i^j$k\\l")).toBe(
				"a\\.b\\*c\\?d\\+e\\(f\\)\\[g\\]\\{h\\}\\|i\\^j\\$k\\\\l"
			);
		});

		it("escapeRegExp leaves plain input unchanged", () => {
			expect(escapeRegExp("plain123")).toBe("plain123");
		});

		it("toRegExp returns a safe {expression, flags} pair for a string", () => {
			const re = toRegExp("string", "pattern", "^abc$", { flags: "i" });
			expect(re).toEqual({ expression: "\"^abc$\"", flags: "\"i\"" });
			const constructed = new Function(`return new RegExp(${re.expression}, ${re.flags});`)();
			expect(constructed.test("ABC")).toBe(true);
		});

		it("toRegExp supports RegExp objects", () => {
			const re = toRegExp("string", "pattern", /^[a-z]+$/i, { allowedFlags: ["i"] });
			expect(re).toEqual({ expression: "\"^[a-z]+$\"", flags: "\"i\"" });
		});

		it("toRegExp rejects an unclosed pattern with a plain Error (not SyntaxError in source)", () => {
			let error;
			try {
				toRegExp("string", "pattern", "[", {});
			} catch (e) {
				error = e;
			}
			expect(error).toBeInstanceOf(Error);
			expect(error).not.toBeInstanceOf(SyntaxError);
			expect(error.message).toMatch(/Invalid string\.pattern regex/);
		});

		it("toRegExp rejects disallowed RegExp flags", () => {
			expect(() => toRegExp("string", "pattern", /x/g, { allowedFlags: ["i"] })).toThrow(
				/uses disallowed flag 'g'/
			);
		});

		it("toRegExp rejects non-string/non-RegExp values", () => {
			expect(() => toRegExp("string", "pattern", 123, {})).toThrow(
				/must be a string or RegExp/
			);
		});
	});
});
