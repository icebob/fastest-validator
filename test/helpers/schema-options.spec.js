"use strict";

const {
	assertNumber,
	assertNonNegativeInteger,
	assertString,
	assertBoolean,
	assertArray,
	assertObject,
	safeStringLiteral,
	safeLiteral,
	toRegExp,
	escapeRegExp,
	escapeLineComment,
} = require("../../lib/helpers/schema-options");

describe("Test helpers: schema-options", () => {
	const TYPE = "testType";
	const FIELD = "testField";

	// ---------- assertNumber ----------
	describe("assertNumber", () => {
		it("should accept finite numbers and null/undefined", () => {
			expect(assertNumber(TYPE, FIELD, null)).toBeUndefined();
			expect(assertNumber(TYPE, FIELD, undefined)).toBeUndefined();
			expect(assertNumber(TYPE, FIELD, 0)).toBe(0);
			expect(assertNumber(TYPE, FIELD, 42)).toBe(42);
			expect(assertNumber(TYPE, FIELD, -3.14)).toBe(-3.14);
		});

		it("should reject non-number values", () => {
			expect(() => assertNumber(TYPE, FIELD, "123")).toThrow(/testType.testField must be a number, got string/);
			expect(() => assertNumber(TYPE, FIELD, {})).toThrow(/testType.testField must be a number, got object/);
			expect(() => assertNumber(TYPE, FIELD, [])).toThrow(/testType.testField must be a number, got object/);
			expect(() => assertNumber(TYPE, FIELD, true)).toThrow(/testType.testField must be a number, got boolean/);
		});

		it("should reject non-finite numbers", () => {
			expect(() => assertNumber(TYPE, FIELD, NaN)).toThrow(/testType.testField must be a number, got a non-finite number/);
			expect(() => assertNumber(TYPE, FIELD, Infinity)).toThrow(/testType.testField must be a number, got a non-finite number/);
			expect(() => assertNumber(TYPE, FIELD, -Infinity)).toThrow(/testType.testField must be a number, got a non-finite number/);
		});

		it("should enforce positive flag", () => {
			expect(() => assertNumber(TYPE, FIELD, 0, { positive: true })).toThrow(/testType.testField must be a positive number/);
			expect(() => assertNumber(TYPE, FIELD, -5, { positive: true })).toThrow(/testType.testField must be a positive number/);
			expect(assertNumber(TYPE, FIELD, 1, { positive: true })).toBe(1);
			expect(assertNumber(TYPE, FIELD, 3.14, { positive: true })).toBe(3.14);
		});

		it("should enforce min bound", () => {
			expect(() => assertNumber(TYPE, FIELD, 9, { min: 10 })).toThrow(/testType.testField must be >= 10/);
			expect(assertNumber(TYPE, FIELD, 10, { min: 10 })).toBe(10);
			expect(assertNumber(TYPE, FIELD, 15, { min: 10 })).toBe(15);
		});

		it("should enforce max bound", () => {
			expect(() => assertNumber(TYPE, FIELD, 11, { max: 10 })).toThrow(/testType.testField must be <= 10/);
			expect(assertNumber(TYPE, FIELD, 10, { max: 10 })).toBe(10);
			expect(assertNumber(TYPE, FIELD, 5, { max: 10 })).toBe(5);
		});

		it("should accept min/max together", () => {
			expect(() => assertNumber(TYPE, FIELD, 5, { min: 10, max: 20 })).toThrow(/testType.testField must be >= 10/);
			expect(() => assertNumber(TYPE, FIELD, 25, { min: 10, max: 20 })).toThrow(/testType.testField must be <= 20/);
			expect(assertNumber(TYPE, FIELD, 15, { min: 10, max: 20 })).toBe(15);
		});
	});

	// ---------- assertNonNegativeInteger ----------
	describe("assertNonNegativeInteger", () => {
		it("should accept non-negative integers and null/undefined", () => {
			expect(assertNonNegativeInteger(TYPE, FIELD, null)).toBeUndefined();
			expect(assertNonNegativeInteger(TYPE, FIELD, undefined)).toBeUndefined();
			expect(assertNonNegativeInteger(TYPE, FIELD, 0)).toBe(0);
			expect(assertNonNegativeInteger(TYPE, FIELD, 42)).toBe(42);
		});

		it("should reject negative numbers", () => {
			expect(() => assertNonNegativeInteger(TYPE, FIELD, -1)).toThrow(/testType.testField must be a non-negative integer/);
		});

		it("should reject non-integers", () => {
			expect(() => assertNonNegativeInteger(TYPE, FIELD, 3.14)).toThrow(/testType.testField must be a non-negative integer/);
			expect(() => assertNonNegativeInteger(TYPE, FIELD, -2.5)).toThrow(/testType.testField must be a non-negative integer/);
		});

		it("should reject non-number values", () => {
			expect(() => assertNonNegativeInteger(TYPE, FIELD, "123")).toThrow(/testType.testField must be a number, got string/);
			expect(() => assertNonNegativeInteger(TYPE, FIELD, NaN)).toThrow(/testType.testField must be a number, got a non-finite number/);
		});
	});

	// ---------- assertString ----------
	describe("assertString", () => {
		it("should accept strings and null/undefined", () => {
			expect(assertString(TYPE, FIELD, null)).toBeUndefined();
			expect(assertString(TYPE, FIELD, undefined)).toBeUndefined();
			expect(assertString(TYPE, FIELD, "")).toBe("");
			expect(assertString(TYPE, FIELD, "hello")).toBe("hello");
		});

		it("should reject non-string values", () => {
			expect(() => assertString(TYPE, FIELD, 123)).toThrow(/testType.testField must be a string, got number/);
			expect(() => assertString(TYPE, FIELD, {})).toThrow(/testType.testField must be a string, got object/);
			expect(() => assertString(TYPE, FIELD, [])).toThrow(/testType.testField must be a string, got object/);
			expect(() => assertString(TYPE, FIELD, true)).toThrow(/testType.testField must be a string, got boolean/);
			expect(() => assertString(TYPE, FIELD, /test/)).toThrow(/testType.testField must be a string, got object/);
		});
	});

	// ---------- assertBoolean ----------
	describe("assertBoolean", () => {
		it("should accept booleans and null/undefined", () => {
			expect(assertBoolean(TYPE, FIELD, null)).toBeUndefined();
			expect(assertBoolean(TYPE, FIELD, undefined)).toBeUndefined();
			expect(assertBoolean(TYPE, FIELD, false)).toBe(false);
			expect(assertBoolean(TYPE, FIELD, true)).toBe(true);
		});

		it("should reject non-boolean values", () => {
			expect(() => assertBoolean(TYPE, FIELD, 0)).toThrow(/testType.testField must be a boolean, got number/);
			expect(() => assertBoolean(TYPE, FIELD, 1)).toThrow(/testType.testField must be a boolean, got number/);
			expect(() => assertBoolean(TYPE, FIELD, "true")).toThrow(/testType.testField must be a boolean, got string/);
			expect(() => assertBoolean(TYPE, FIELD, "false")).toThrow(/testType.testField must be a boolean, got string/);
			expect(() => assertBoolean(TYPE, FIELD, {})).toThrow(/testType.testField must be a boolean, got object/);
			expect(() => assertBoolean(TYPE, FIELD, [])).toThrow(/testType.testField must be a boolean, got object/);
		});
	});

	// ---------- assertArray ----------
	describe("assertArray", () => {
		it("should accept arrays and null/undefined", () => {
			expect(assertArray(TYPE, FIELD, null)).toBeUndefined();
			expect(assertArray(TYPE, FIELD, undefined)).toBeUndefined();
			expect(assertArray(TYPE, FIELD, [])).toEqual([]);
			expect(assertArray(TYPE, FIELD, [1, 2, 3])).toEqual([1, 2, 3]);
		});

		it("should reject non-array values", () => {
			expect(() => assertArray(TYPE, FIELD, "123")).toThrow(/testType.testField must be an array, got string/);
			expect(() => assertArray(TYPE, FIELD, 0)).toThrow(/testType.testField must be an array, got number/);
			expect(() => assertArray(TYPE, FIELD, {})).toThrow(/testType.testField must be an array, got object/);
			expect(() => assertArray(TYPE, FIELD, true)).toThrow(/testType.testField must be an array, got boolean/);
		});
	});

	// ---------- assertObject ----------
	describe("assertObject", () => {
		it("should accept plain objects and null/undefined", () => {
			expect(assertObject(TYPE, FIELD, null)).toBeUndefined();
			expect(assertObject(TYPE, FIELD, undefined)).toBeUndefined();
			expect(assertObject(TYPE, FIELD, {})).toEqual({});
			expect(assertObject(TYPE, FIELD, { a: 1 })).toEqual({ a: 1 });
			expect(assertObject(TYPE, FIELD, Object.create(null))).toEqual({}); // plain object
		});

		it("should reject non-object values and arrays", () => {
			expect(() => assertObject(TYPE, FIELD, "123")).toThrow(/testType.testField must be an object, got string/);
			expect(() => assertObject(TYPE, FIELD, 0)).toThrow(/testType.testField must be an object, got number/);
			expect(() => assertObject(TYPE, FIELD, true)).toThrow(/testType.testField must be an object, got boolean/);
			expect(() => assertObject(TYPE, FIELD, [])).toThrow(/testType.testField must be an object, got array/);
			expect(() => assertObject(TYPE, FIELD, [1, 2])).toThrow(/testType.testField must be an object, got array/);
		});
	});

	// ---------- safeStringLiteral ----------
	describe("safeStringLiteral", () => {
		it("should JSON-serialize any value", () => {
			expect(safeStringLiteral(null)).toBe("null");
			// JSON.stringify(undefined) returns undefined
			expect(safeStringLiteral(undefined)).toBeUndefined();
			expect(safeStringLiteral(0)).toBe("0");
			expect(safeStringLiteral(42)).toBe("42");
			expect(safeStringLiteral(-3.14)).toBe("-3.14");
			expect(safeStringLiteral("")).toBe("\"\"");
			expect(safeStringLiteral("hello")).toBe("\"hello\"");
			expect(safeStringLiteral("he said \"hi\"")).toBe("\"he said \\\"hi\\\"\"");
			expect(safeStringLiteral(true)).toBe("true");
			expect(safeStringLiteral(false)).toBe("false");
			expect(safeStringLiteral([1, 2, 3])).toBe("[1,2,3]");
			expect(safeStringLiteral({ a: 1 })).toBe("{\"a\":1}");
		});
	});

	// ---------- safeLiteral ----------
	describe("safeLiteral", () => {
		it("should quote strings, return other values as String()", () => {
			expect(safeLiteral(null)).toBe("null");
			expect(safeLiteral(undefined)).toBe("undefined");
			expect(safeLiteral(0)).toBe("0");
			expect(safeLiteral(42)).toBe("42");
			expect(safeLiteral(-3.14)).toBe("-3.14");
			expect(safeLiteral("")).toBe("\"\"");
			expect(safeLiteral("hello")).toBe("\"hello\"");
			expect(safeLiteral("he said \"hi\"")).toBe("\"he said \\\"hi\\\"\"");
			expect(safeLiteral(true)).toBe("true");
			expect(safeLiteral(false)).toBe("false");
			expect(safeLiteral([1, 2, 3])).toBe("1,2,3"); // String(array) = join
			expect(safeLiteral({ a: 1 })).toBe("[object Object]");
		});
	});

	// ---------- toRegExp ----------
	describe("toRegExp", () => {
		it("should return null for null/undefined input", () => {
			expect(toRegExp(TYPE, FIELD, null)).toBeNull();
			expect(toRegExp(TYPE, FIELD, undefined)).toBeNull();
		});

		it("should compile valid string patterns", () => {
			const result = toRegExp(TYPE, FIELD, "abc");
			expect(result).toEqual({ expression: "\"abc\"", flags: "\"\"" }); // no flags
		});

		it("should throw for invalid string patterns", () => {
			expect(() => toRegExp(TYPE, FIELD, "["))
				.toThrow(/Invalid testType.testField regex/);
			expect(() => toRegExp(TYPE, FIELD, "(unclosed"))
				.toThrow(/Invalid testType.testField regex/);
			expect(() => toRegExp(TYPE, FIELD, "\\"))
				.toThrow(/Invalid testType.testField regex/);
		});

		it("should accept RegExp objects", () => {
			const re = /abc/gim;
			const result = toRegExp(TYPE, FIELD, re);
			expect(result).toEqual({ expression: "\"abc\"", flags: "\"gim\"" });
		});

		it("should reject disallowed flags via allowedFlags", () => {
			// string patterns ignore allowedFlags; only RegExp objects enforce it
			expect(() => toRegExp(TYPE, FIELD, /abc/g, { allowedFlags: ["i"] }))
				.toThrow(/testType.testField uses disallowed flag 'g'/);
			// /abc/im -> sorted flags "im" ; 'i' allowed, 'm' not
			expect(() => toRegExp(TYPE, FIELD, /abc/im, { allowedFlags: ["i"] }))
				.toThrow(/testType.testField uses disallowed flag 'm'/);
			expect(toRegExp(TYPE, FIELD, /abc/i, { allowedFlags: ["i"] }))
				.toEqual({ expression: "\"abc\"", flags: "\"i\"" }); // flags from the RegExp object
		});

		it("should accept additional flags from flags option", () => {
			const result = toRegExp(TYPE, FIELD, "abc", { flags: "i" });
			expect(result).toEqual({ expression: "\"abc\"", flags: "\"i\"" });
		});

		it("should reject non-string/non-RegExp values", () => {
			expect(() => toRegExp(TYPE, FIELD, 123))
				.toThrow(/testType.testField must be a string or RegExp object, got number/);
			expect(() => toRegExp(TYPE, FIELD, {}))
				.toThrow(/testType.testField must be a string or RegExp object, got object/);
			expect(() => toRegExp(TYPE, FIELD, []))
				.toThrow(/testType.testField must be a string or RegExp object, got object/);
		});
	});

	// ---------- escapeRegExp ----------
	describe("escapeRegExp", () => {
		it("should escape regex metacharacters", () => {
			expect(escapeRegExp(".")).toBe("\\.");
			expect(escapeRegExp("*")).toBe("\\*");
			expect(escapeRegExp("+")).toBe("\\+");
			expect(escapeRegExp("?")).toBe("\\?");
			expect(escapeRegExp("^")).toBe("\\^");
			expect(escapeRegExp("$")).toBe("\\$");
			expect(escapeRegExp("{")).toBe("\\{");
			expect(escapeRegExp("}")).toBe("\\}");
			expect(escapeRegExp("(")).toBe("\\(");
			expect(escapeRegExp(")")).toBe("\\)");
			expect(escapeRegExp("[")).toBe("\\["); // [ and ] need double escaping?
			expect(escapeRegExp("]")).toBe("\\]");
			expect(escapeRegExp("|")).toBe("\\|");
			expect(escapeRegExp("\\")).toBe("\\\\");
		});

		it("should leave other characters unchanged", () => {
			expect(escapeRegExp("abc")).toBe("abc");
			expect(escapeRegExp("a.b*c")).toBe("a\\.b\\*c");
			expect(escapeRegExp("(hello)")).toBe("\\(hello\\)");
			expect(escapeRegExp("[test]")).toBe("\\[test\\]");
		});
	});

	// ---------- escapeLineComment ----------
	describe("escapeLineComment", () => {
		it("should escape all four JS line terminators as \\n", () => {
			expect(escapeLineComment("a\nb")).toBe("a\\nb");
			expect(escapeLineComment("a\rb")).toBe("a\\nb");
			expect(escapeLineComment("a\u2028b")).toBe("a\\nb");
			expect(escapeLineComment("a\u2029b")).toBe("a\\nb");
			expect(escapeLineComment("\n\r\u2028\u2029")).toBe("\\n\\n\\n\\n");
		});

		it("should leave normal characters unchanged", () => {
			expect(escapeLineComment("plain")).toBe("plain");
			expect(escapeLineComment("he said \"hi\"")).toBe("he said \"hi\"");
			expect(escapeLineComment("back\\slash")).toBe("back\\slash");
			expect(escapeLineComment("a/b/c")).toBe("a/b/c");
			expect(escapeLineComment("a\tb")).toBe("a\tb"); // tab is not a line terminator
		});

		it("should return an empty string for empty input", () => {
			expect(escapeLineComment("")).toBe("");
		});

		it("should never leave a raw line terminator in the output", () => {
			// guards against regressions where JSON.stringify-style escaping
			// (which skips U+2028/U+2029) is reintroduced
			expect(escapeLineComment("a\nb\u2028c\u2029d\r")).not.toMatch(/[\n\r\u2028\u2029]/);
			expect(escapeLineComment("\n\r\u2028\u2029")).not.toMatch(/[\n\r\u2028\u2029]/);
		});
	});
});