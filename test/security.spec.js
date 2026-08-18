"use strict";

const Validator = require("../lib/validator");
const assert = require("assert");

describe("Security tests for code injection", function () {
	it("should reject non-string contains during compilation", function () {
		const v = new Validator();
		try {
			v.compile({
				test: { type: "string", contains: {} } // object not allowed
			});
			assert.fail("Expected error");
		} catch (e) {
			assert(/contains must be a string/.test(e.message));
		}
	});

	it("should safely handle string contains with dangerous value", function () {
		const v = new Validator();
		// This should not throw during compilation
		const schema = {
			test: { type: "string", contains: "\"); alert(1); //" }
		};
		const checkFn = v.compile(schema);
		// The generated code should treat the contains value as literal string
		// So validation will fail because the test string does not contain that literal
		const result = checkFn({ test: "some value" });
		assert(Array.isArray(result));
		assert.strictEqual(result[0].type, "stringContains");
		// Ensure no exception was thrown due to syntax error in generated code
	});

	it("should reject non-string/RegExp pattern during compilation", function () {
		const v = new Validator();
		try {
			v.compile({
				test: { type: "string", pattern: [] } // array not allowed
			});
			assert.fail("Expected error");
		} catch (e) {
			assert(/pattern must be a string or RegExp object/.test(e.message));
		}
	});

	it("should safely handle string pattern with dangerous regex string", function () {
		const v = new Validator();
		// A pattern that tries to break out: "/.*/; alert(1); //"
		const schema = {
			test: { type: "string", pattern: "/.*/; alert(1); //" }
		};
		// Should compile without throwing
		const checkFn = v.compile(schema);
		// The pattern will be treated as a literal regex string; JSON.stringify will escape it
		// So the generated RegExp will be the literal string "/.*/; alert(1); //" as pattern,
		// which likely will not match anything, causing validation failure but no code execution.
		const result = checkFn({ test: "anything" });
		assert(Array.isArray(result));
		assert.strictEqual(result[0].type, "stringPattern");
	});

	it("should accept valid RegExp object for pattern", function () {
		const v = new Validator();
		const schema = {
			test: { type: "string", pattern: /^abc/ }
		};
		const checkFn = v.compile(schema);
		const ok = checkFn({ test: "abcdef" });
		assert.strictEqual(ok, true);
		const fail = checkFn({ test: "xyz" });
		assert(Array.isArray(fail));
		assert.strictEqual(fail[0].type, "stringPattern");
	});

	it("should reject numeric min/max that are not numbers during compilation", function () {
		const v = new Validator();
		try {
			v.compile({
				test: { type: "string", min: "5" } // string not allowed
			});
			assert.fail("Expected error");
		} catch (e) {
			assert(/min must be a number/.test(e.message));
		}
		try {
			v.compile({
				test: { type: "string", max: {} }
			});
			assert.fail("Expected error");
		} catch (e) {
			assert(/max must be a number/.test(e.message));
		}
	});

	it("should safely handle numeric min/max with extreme values", function () {
		const v = new Validator();
		const schema = {
			test: { type: "string", min: 2, max: 10 }
		};
		const checkFn = v.compile(schema);
		// Should work fine
		assert.strictEqual(checkFn({ test: "xy" }), true);
		const tooShort = checkFn({ test: "x" }); // length 1 < min
		assert(Array.isArray(tooShort));
		assert.strictEqual(tooShort[0].type, "stringMin");
		const tooLong = checkFn({ test: "a".repeat(11) }); // length 11 > max
		assert(Array.isArray(tooLong));
		assert.strictEqual(tooLong[0].type, "stringMax");
	});

	it("should not execute injected code via a malicious custom message", function () {
		const v = new Validator();
		let fired = false;
		global.__FV_MSG_INJECTED__ = () => { fired = true; return 1; };
		try {
			const payloads = [
				"\") ; global.__FV_MSG_INJECTED__(); //",
				"\" ; global.__FV_MSG_INJECTED__(); //",
				"'); global.__FV_MSG_INJECTED__(); //"
			];
			for (const p of payloads) {
				fired = false;
				const checkFn = v.compile({
					test: { type: "string", messages: { string: p } }
				});
				checkFn({ test: 123 });
				assert.strictEqual(fired, false, `payload executed: ${p}`);
			}
		} finally {
			delete global.__FV_MSG_INJECTED__;
		}
	});

	it("should preserve a custom message containing quotes/backslashes", function () {
		const v = new Validator();
		const checkFn = v.compile({
			test: { type: "string", messages: { string: "It's O'Brien \\ path" } }
		});
		const res = checkFn({ test: 123 });
		assert(Array.isArray(res));
		assert.strictEqual(res[0].message, "It's O'Brien \\ path");
	});
});