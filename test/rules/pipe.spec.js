"use strict";

const Validator = require("../../lib/validator");

describe("Test rule: pipe", () => {
	const v = new Validator({ useNewCustomCheckerFunction: true });

	it("should run nested pipes and merge transformations", () => {
		const schema = {
			payload: { type: "pipe", steps: [
				{ type: "string", trim: true },
				{ type: "pipe", steps: [
					{ type: "custom", check(value, errors) {
						try {
							return JSON.parse(value);
						} catch (err) {
							errors.push({ type: "object" });
							return value;
						}
					}},
					{ type: "object", props: {
						user: { type: "pipe", steps: [
							{ type: "object", props: {
								id: { type: "number", integer: true, positive: true },
								coords: { type: "array", items: "number", length: 2 }
							} },
							{ type: "custom", check(user) {
								return Object.assign({ role: "guest" }, user);
							} }
						] }
					} }
				] }
			] }
		};

		const check = v.compile(schema);
		const obj = { payload: "{\"user\":{\"id\":3,\"coords\":[48.1,11.5]}}" };

		expect(check(obj)).toBe(true);
		expect(obj.payload).toEqual({ user: { id: 3, coords: [48.1, 11.5], role: "guest" } });
	});

	it("should stop on inner error and report nested field", () => {
		const schema = {
			payload: { type: "pipe", steps: [
				{ type: "string", trim: true },
				{ type: "pipe", steps: [
					{ type: "custom", check(value, errors) {
						try {
							return JSON.parse(value);
						} catch (err) {
							errors.push({ type: "object" });
							return value;
						}
					}},
					{ type: "object", props: {
						user: { type: "pipe", steps: [
							{ type: "object", props: {
								id: { type: "number", integer: true, positive: true },
								coords: { type: "array", items: "number", length: 2 }
							} },
							{ type: "custom", check(user) {
								return Object.assign({ role: "guest" }, user);
							} }
						] }
					} }
				] }
			] }
		};

		const check = v.compile(schema);
		const obj = { payload: "{\"user\":{\"id\":\"nope\",\"coords\":[48.1,11.5]}}" };

		const res = check(obj);
		expect(res).toEqual([{
			type: "number",
			field: "payload.user.id",
			actual: "nope",
			message: "The 'payload.user.id' field must be a number."
		}]);
	});

	it("should validate, transform, then re-validate", () => {
		const schema = {
			amount: { type: "pipe", steps: [
				{ type: "string", trim: true },
				{ type: "custom", check(value, errors) {
					const normalized = value.replace(",", ".");
					const parsed = Number(normalized);
					if (Number.isNaN(parsed)) {
						errors.push({ type: "number" });
					}
					return parsed;
				} },
				{ type: "number", integer: true, min: 1 }
			] }
		};

		const check = v.compile(schema);
		const obj = { amount: " 42 " };

		expect(check(obj)).toBe(true);
		expect(obj.amount).toBe(42);

		const failed = check({ amount: "abc" });
		expect(failed).toEqual([{
			type: "number",
			field: "amount",
			message: "The 'amount' field must be a number."
		}]);
	});

	it("should return value if steps is not an array", () => {
		const check = v.compile({ a: { type: "pipe", steps: {} } });
		const obj = { a: " 42 " };
		expect(check(obj)).toBe(true);
		expect(obj.a).toBe(" 42 ");
	});

	it("should return value if steps is missing", async () => {
		const check = v.compile({ a: { type: "pipe" } });
		const obj = { a: " 42 " };
		expect(check(obj)).toBe(true);
		expect(obj.a).toBe(" 42 ");
	});

	it("should work correctly in async mode", async () => {
		const check = v.compile({ $$async: true, a: { type: "pipe", steps: [{ type: "custom", async check(value) {
			await new Promise((resolve) => {
				setTimeout(resolve, 10);
			});
			return " " + String(Number(value.trim()) + 1) + " ";
		} }] } });
		const obj = { a: " 42 " };
		expect(await check(obj)).toBe(true);
		expect(obj.a).toBe(" 43 ");
	});
});
