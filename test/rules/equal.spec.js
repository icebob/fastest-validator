"use strict";

const Validator = require("../../lib/validator");
const { expectNoCodeExecution } = require("../helpers/security");
const v = new Validator();

describe("Test rule: equal", () => {

	it("should value equals to other field", () => {
		const check = v.compile({ confirm: { type: "equal", field: "pass" } });
		const message = "The 'confirm' field value must be equal to 'pass' field value.";

		expect(check({ confirm: "abcd"})).toEqual([{ type: "equalField", field: "confirm", actual: "abcd", expected: "pass", message }]);
		expect(check({ pass: "1234", confirm: "abcd"})).toEqual([{ type: "equalField", field: "confirm", actual: "abcd", expected: "pass", message }]);
		expect(check({ pass: "1234", confirm: 1234 })).toEqual(true);
		expect(check({ pass: "1234", confirm: "1234" })).toEqual(true);
	});

	it("should value strict equals to other field", () => {
		const check = v.compile({ confirm: { type: "equal", field: "pass", strict: true } });
		const message = "The 'confirm' field value must be equal to 'pass' field value.";

		expect(check({ confirm: "abcd"})).toEqual([{ type: "equalField", field: "confirm", actual: "abcd", expected: "pass", message }]);
		expect(check({ pass: "1234", confirm: "abcd"})).toEqual([{ type: "equalField", field: "confirm", actual: "abcd", expected: "pass", message }]);
		expect(check({ pass: "1234", confirm: 1234 })).toEqual([{ type: "equalField", field: "confirm", actual: 1234, expected: "pass", message }]);
		expect(check({ pass: "1234", confirm: "1234" })).toEqual(true);
	});

	it("should value equals to a static value", () => {
		const check = v.compile({ accept: { type: "equal", value: true } });
		const message = "The 'accept' field value must be equal to 'true'.";

		expect(check({ accept: "abcd" })).toEqual([{ type: "equalValue", field: "accept", actual: "abcd", expected: true, message }]);
		expect(check({ accept: 100 })).toEqual([{ type: "equalValue", field: "accept", actual: 100, expected: true, message }]);
		expect(check({ accept: "true" })).toEqual([{ type: "equalValue", field: "accept", actual: "true", expected: true, message }]);
		expect(check({ accept: false })).toEqual([{ type: "equalValue", field: "accept", actual: false, expected: true, message }]);
		expect(check({ accept: 1 })).toEqual(true);
		expect(check({ accept: true })).toEqual(true);
	});

	it("should value strict equals to a static value", () => {
		const check = v.compile({ accept: { type: "equal", value: true, strict: true } });
		const message = "The 'accept' field value must be equal to 'true'.";

		expect(check({ accept: "abcd" })).toEqual([{ type: "equalValue", field: "accept", actual: "abcd", expected: true, message }]);
		expect(check({ accept: 100 })).toEqual([{ type: "equalValue", field: "accept", actual: 100, expected: true, message }]);
		expect(check({ accept: "true" })).toEqual([{ type: "equalValue", field: "accept", actual: "true", expected: true, message }]);
		expect(check({ accept: false })).toEqual([{ type: "equalValue", field: "accept", actual: false, expected: true, message }]);
		expect(check({ accept: 1 })).toEqual([{ type: "equalValue", field: "accept", actual: 1, expected: true, message }]);
		expect(check({ accept: true })).toEqual(true);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			confirm: {
				type: "equal",
				field: "pass"
			}
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);
		const message = "The 'confirm' field value must be equal to 'pass' field value.";

		expect(clonedSchema).toEqual(schema);

		expect(check({ confirm: "abcd"})).toEqual([{ type: "equalField", field: "confirm", actual: "abcd", expected: "pass", message }]);
		expect(check({ pass: "1234", confirm: "abcd"})).toEqual([{ type: "equalField", field: "confirm", actual: "abcd", expected: "pass", message }]);
		expect(check({ pass: "1234", confirm: 1234 })).toEqual(true);
		expect(check({ pass: "1234", confirm: "1234" })).toEqual(true);
	});

	describe("Security: equal rule injection tests", () => {
		it("should escape a malicious field value (no SyntaxError, no execution)", () => {
			expectNoCodeExecution(() => {
				v.compile({
					$$root: true,
					type: "object",
					properties: {
						confirm: { type: "equal", field: "\"]; global.__FV_INJECTED__.fired = true; //[" }
					}
				});
			}, "equal.field injection via close-bracket");
		});

		it("should not execute code via field injection payload", () => {
			expectNoCodeExecution(() => {
				v.compile({
					$$root: true,
					type: "equal",
					field: "\"); global.__FV_INJECTED__.fired = true; //"
				});
			}, "equal.field injection");
		});

		it("should reject a non-string field at compile time", () => {
			expect(() => v.compile({ $$root: true, type: "equal", field: 123 }))
				.toThrow(/equal.field must be a string/);
		});
	});
});
