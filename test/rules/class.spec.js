"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: class", () => {

	it("should value instanceOf Buffer", () => {
		const check = v.compile({ rawData: { type: "class", instanceOf: Buffer } });
		const message = "The 'rawData' field must be an instance of the 'Buffer' class.";

		expect(check({ rawData: "1234"})).toEqual([{ type: "classInstanceOf", field: "rawData", actual: "1234", expected: "Buffer", message }]);
		expect(check({ rawData: [1, 2, 3]})).toEqual([{ type: "classInstanceOf", field: "rawData", actual: [1, 2, 3], expected: "Buffer", message }]);
		expect(check({ rawData: Buffer.from([1, 2, 3]) })).toEqual(true);
		expect(check({ rawData: Buffer.alloc(3) })).toEqual(true);
	});

	it("should work with custom checker function", () => {
		const checker = vi.fn((v) => v);
		const check = v.compile({ rawData: { type: "class", instanceOf: Buffer, custom: checker } });

		expect(check({ rawData: Buffer.from([1, 2, 3]) })).toEqual(true);
		// expect(checker).toBeCalledTimes(1);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "class",
			instanceOf: Buffer
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(schema).toStrictEqual(clonedSchema);

		const message = "The '' field must be an instance of the 'Buffer' class.";

		expect(check("1234")).toEqual([{ type: "classInstanceOf", field: undefined, actual: "1234", expected: "Buffer", message }]);
		expect(check([1, 2, 3])).toEqual([{ type: "classInstanceOf", field: undefined, actual: [1, 2, 3], expected: "Buffer", message }]);
		expect(check(Buffer.from([1, 2, 3]) )).toEqual(true);
		expect(check(Buffer.alloc(3) )).toEqual(true);
	});

	describe("Security tests", () => {
		it("should not execute injected code via a malicious class name", () => {
			let fired = false;
			global.__FV_CLASS_INJECTED__ = () => { fired = true; return 1; };

			const Evil = function () {};
			Object.defineProperty(Evil, "name", { value: "Evil'); global.__FV_CLASS_INJECTED__(); //" });

			try {
				const check = v.compile({ rawData: { type: "class", instanceOf: Evil } });
				const res = check({ rawData: "1234" });
				// Compilation and validation must succeed, injected code must not run
				expect(Array.isArray(res)).toBe(true);
				expect(fired).toBe(false);
				// The class name is preserved safely in the error message
				expect(res[0].expected).toBe("Evil'); global.__FV_CLASS_INJECTED__(); //");
			} finally {
				delete global.__FV_CLASS_INJECTED__;
			}
		});
	});
});
