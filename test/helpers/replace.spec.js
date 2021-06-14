const replace = require("../../lib/helpers/replace");

describe("replace", () => {
	it("should replace string", () => {
		expect(replace("foo bar", "foo", "zoo")).toBe("zoo bar");
	});

	it("should replace if newValue is null or undefined", () => {
		expect(replace("foo bar", "foo", undefined)).toBe(" bar");
		expect(replace("foo bar", "foo", null)).toBe(" bar");
	});

	it("should replace if newValue has valid toString prototype", () => {
		expect(replace("foo bar", "foo", { a: "b" })).toBe("[object Object] bar");
		expect(replace("foo bar", "foo", ["a", "b"])).toBe("a,b bar");
	});

	it("should replace if newValue has invalid toString prototype", () => {
		expect(replace("foo bar", "foo", { toString: 1 })).toBe("object bar");
	});
});
