import Validator from "../../../";

const v = new Validator();

describe("TypeScript Definitions", () => {
	describe("Test rule: boolean", () => {
		it("should check values", () => {
			const check = v.compile({ $$root: true, type: "boolean" });
			const message = "The '' field must be a boolean.";

			// @ts-expect-error
			expect(check(0)).toEqual([{ type: "boolean", actual: 0, message }]);
			// @ts-expect-error
			expect(check(1)).toEqual([{ type: "boolean", actual: 1, message }]);
			// @ts-expect-error
			expect(check("")).toEqual([
				{ type: "boolean", actual: "", message },
			]);
			// @ts-expect-error
			expect(check("true")).toEqual([
				{ type: "boolean", actual: "true", message },
			]);
			// @ts-expect-error
			expect(check("false")).toEqual([
				{ type: "boolean", actual: "false", message },
			]);
			// @ts-expect-error
			expect(check([])).toEqual([
				{ type: "boolean", actual: [], message },
			]);
			// @ts-expect-error
			expect(check({})).toEqual([
				{ type: "boolean", actual: {}, message },
			]);

			expect(check(false)).toEqual(true);
			expect(check(true)).toEqual(true);
		});

		it("should convert & check values", () => {
			const check = v.compile({
				$$root: true,
				type: "boolean",
				convert: true,
			});
			const message = "The '' field must be a boolean.";

			expect(check(0)).toEqual(true);
			expect(check(1)).toEqual(true);
			// @ts-expect-error
			expect(check("")).toEqual([
				{ type: "boolean", actual: "", message },
			]);
			expect(check("true")).toEqual(true);
			expect(check("false")).toEqual(true);
			expect(check("on")).toEqual(true);
			expect(check("off")).toEqual(true);
			// @ts-expect-error
			expect(check([])).toEqual([
				{ type: "boolean", actual: [], message },
			]);
			// @ts-expect-error
			expect(check({})).toEqual([
				{ type: "boolean", actual: {}, message },
			]);

			expect(check(false)).toEqual(true);
			expect(check(true)).toEqual(true);
		});

		it("should sanitize", () => {
			const check = v.compile({
				status: { type: "boolean", convert: true },
			});

			let obj: {
				status: 0 | 1 | boolean | "true" | "false" | "on" | "off";
			} = { status: 0 };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ status: false });

			obj = { status: 1 };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ status: true });

			obj = { status: "true" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ status: true });

			obj = { status: "false" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ status: false });

			obj = { status: "off" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ status: false });

			obj = { status: "on" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ status: true });
		});
	});
});
