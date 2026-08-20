"use strict";

const {
	INJECTION_PAYLOADS,
	attempt,
	expectNoCodeExecution,
	resetGlobalSink,
} = require("./security");

describe("Test helpers: security", () => {
	beforeEach(() => {
		resetGlobalSink();
	});

	describe("attempt", () => {
		it("should report no execution / no throw for a clean function", () => {
			const res = attempt(() => 42);
			expect(res.threw).toBe(false);
			expect(res.error).toBeUndefined();
			expect(res.executed).toBe(false);
			expect(res.consoleCalls).toBe(0);
		});

		it("should capture thrown errors", () => {
			const boom = new Error("boom");
			const res = attempt(() => { throw boom; });
			expect(res.threw).toBe(true);
			expect(res.error).toBe(boom);
		});

		it("should register console output through the spy", () => {
			// eslint-disable-next-line no-console
			const res = attempt(() => { console.log("visible"); });
			expect(res.consoleCalls).toBe(1);
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
		});

		it("should restore console.log after the attempt", () => {
			// eslint-disable-next-line no-console
			const original = console.log;
			// eslint-disable-next-line no-console
			attempt(() => { console.log("x"); });
			// eslint-disable-next-line no-console
			expect(console.log).toBe(original);
		});

		it("sanity: detects a real sink write as executed and ignores innocuous code", () => {
			// Meta-validation of the harness itself: if the payloads ever wrote to
			// the global sink (i.e. generated code executed foreign code), `attempt`
			// MUST report it. A dead `executed` field would silently neuter every
			// "should not execute" assertion across the security suites.
			const executedRes = attempt(() => {
				global.__FV_INJECTED__.fired = true;
			});
			expect(executedRes.executed).toBe(true);

			const cleanRes = attempt(() => 42);
			expect(cleanRes.executed).toBe(false);
		});
	});

	describe("expectNoCodeExecution", () => {
		it("should resolve for a safe function", () => {
			const res = expectNoCodeExecution(() => 42, "safe");
			expect(res.threw).toBe(false);
			expect(res.executed).toBe(false);
		});

		it("should throw when injected code executed (global sink written)", () => {
			expect(() =>
				expectNoCodeExecution(() => {
					global.__FV_INJECTED__.fired = true;
				}, "payload")
			).toThrow(/INJECTED CODE EXECUTED \(payload\)/);
		});

		it("should throw when the function produced console output", () => {
			expect(() =>
				expectNoCodeExecution(() => {
					// eslint-disable-next-line no-console
					console.log("leaked");
				}, "payload")
			).toThrow(/UNEXPECTED CONSOLE OUTPUT \(payload\)/);
		});

		it("should throw when the function threw a SyntaxError", () => {
			expect(() =>
				expectNoCodeExecution(() => {
					throw new SyntaxError("bad generated code");
				}, "payload")
			).toThrow(/SYNTAX ERROR IN GENERATED CODE \(payload\)/);
		});

		it("should not treat a plain Error as a syntax/injection failure", () => {
			const res = expectNoCodeExecution(() => { throw new Error("runtime"); }, "payload");
			expect(res.threw).toBe(true);
			expect(res.error).toBeInstanceOf(Error);
			expect(res.error).not.toBeInstanceOf(SyntaxError);
		});

		it("should work without an optional context label", () => {
			const res = expectNoCodeExecution(() => undefined);
			expect(res.threw).toBe(false);
			expect(res.error).toBeUndefined();
		});
	});

	describe("INJECTION_PAYLOADS export", () => {
		it("should expose a non-empty battery of [label, value] pairs", () => {
			expect(Array.isArray(INJECTION_PAYLOADS)).toBe(true);
			expect(INJECTION_PAYLOADS.length).toBeGreaterThan(0);
			expect(INJECTION_PAYLOADS[0]).toHaveLength(2);
			// Every payload must signal execution the same way the harness detects
			// it (`global.__FV_INJECTED__.fired = true`); a mismatch would silently
			// disable the `executed` detection (see the sanity test above).
			INJECTION_PAYLOADS.forEach(([, payload]) => {
				expect(payload).toContain("__FV_INJECTED__.fired = true");
			});
		});
	});
});