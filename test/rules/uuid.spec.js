"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: uuid", () => {

	it("should check type of value", () => {
		const check = v.compile({ $$root: true, type: "uuid" });
		let message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);

		message = "The '' field must be a valid UUID.";
		expect(check("")).toEqual([{ type: "uuid", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "uuid", actual: "true", message }]);
		expect(check("10000000-0000-0000-0000-000000000000")).toEqual([{ type: "uuid", actual: "10000000-0000-0000-0000-000000000000", message }]);
		expect(check("1234567-1234-1234-1234-1234567890ab")).toEqual([{ type: "uuid", actual: "1234567-1234-1234-1234-1234567890ab", message }]);
		expect(check("12345678-1234-1234-1234-1234567890ab")).toEqual(true);
	});

	it("check invalid version", () => {
		let check = v.compile({ $$root: true, type: "uuid" });
		let message = "The '' field must be a valid UUID.";

		expect(check("00000000-0000-7000-0000-000000000000")).toEqual([{ type: "uuid", actual: "00000000-0000-7000-0000-000000000000", message }]);
		expect(check("fdda765f-fc57-5604-c269-52a7df8164ec")).toEqual([{ type: "uuid", actual: "fdda765f-fc57-5604-c269-52a7df8164ec", message }]);

		const check0 = v.compile({ $$root: true, type: "uuid", version: 0 });
		const check1 = v.compile({ $$root: true, type: "uuid", version: 1 });
		const check2 = v.compile({ $$root: true, type: "uuid", version: 2 });
		const check3 = v.compile({ $$root: true, type: "uuid", version: 3 });
		const check4 = v.compile({ $$root: true, type: "uuid", version: 4 });
		const check5 = v.compile({ $$root: true, type: "uuid", version: 5 });
		message = "The '' field must be a valid UUID version provided.";

		expect(check0("00000000-0000-1000-0000-000000000000")).toEqual([{"actual": 1, "expected": 0, "type": "uuidVersion", message}]);
		expect(check1("9a7b330a-a736-51e5-af7f-feaf819cdc9f")).toEqual([{"actual": 5, "expected": 1, "type": "uuidVersion", message}]);
		expect(check1("9a7b330a-a736-61e5-af7f-feaf819cdc9f")).toEqual([{"actual": 6, "expected": 1, "type": "uuidVersion", message}]);
		expect(check1("9a7b330a-a736-51e5-af7f-feaf819cdc9f")).toEqual([{"actual": 5, "expected": 1, "type": "uuidVersion", message}]);
		expect(check2("9a7b330a-a736-41e5-af7f-feaf819cdc9f")).toEqual([{"actual": 4, "expected": 2, "type": "uuidVersion", message}]);
		expect(check3("9a7b330a-a736-41e5-af7f-feaf819cdc9f")).toEqual([{"actual": 4, "expected": 3, "type": "uuidVersion", message}]);
		expect(check4("9a7b330a-a736-21e5-af7f-feaf819cdc9f")).toEqual([{"actual": 2, "expected": 4, "type": "uuidVersion", message}]);
		expect(check5("9a7b330a-a736-11e5-af7f-feaf819cdc9f")).toEqual([{"actual": 1, "expected": 5, "type": "uuidVersion", message}]);
	});

	it("check valid version", () => {
		const check0 = v.compile({ $$root: true, type: "uuid", version: 0 });
		const check1 = v.compile({ $$root: true, type: "uuid", version: 1 });
		const check2 = v.compile({ $$root: true, type: "uuid", version: 2 });
		const check3 = v.compile({ $$root: true, type: "uuid", version: 3 });
		const check4 = v.compile({ $$root: true, type: "uuid", version: 4 });
		const check5 = v.compile({ $$root: true, type: "uuid", version: 5 });
		const check6 = v.compile({ $$root: true, type: "uuid", version: 6 });

		expect(check0("00000000-0000-0000-0000-000000000000")).toEqual(true);
		expect(check1("45745c60-7b1a-11e8-9c9c-2d42b21b1a3e")).toEqual(true);
		expect(check2("9a7b330a-a736-21e5-af7f-feaf819cdc9f")).toEqual(true);
		expect(check3("9125a8dc-52ee-365b-a5aa-81b0b3681cf6")).toEqual(true);
		expect(check4("10ba038e-48da-487b-96e8-8d3b99b6d18a")).toEqual(true);
		expect(check5("fdda765f-fc57-5604-a269-52a7df8164ec")).toEqual(true);
		expect(check6("a9030619-8514-6970-e0f9-81b9ceb08a5f")).toEqual(true);
	});

	it("should not be case insensitive", () => {
		const check1 = v.compile({ $$root: true, type: "uuid", version: 1 });
		const check2 = v.compile({ $$root: true, type: "uuid", version: 2 });
		const check3 = v.compile({ $$root: true, type: "uuid", version: 3 });
		const check4 = v.compile({ $$root: true, type: "uuid", version: 4 });
		const check5 = v.compile({ $$root: true, type: "uuid", version: 5 });
		const check6 = v.compile({ $$root: true, type: "uuid", version: 6 });

		expect(check1("45745c60-7b1a-11e8-9c9c-2d42b21b1a3e")).toEqual(true);
		expect(check2("9a7b330a-a736-21e5-af7f-feaf819cdc9f")).toEqual(true);
		expect(check3("9125a8dc-52ee-365b-a5aa-81b0b3681cf6")).toEqual(true);
		expect(check4("10ba038e-48da-487b-96e8-8d3b99b6d18a")).toEqual(true);
		expect(check5("fdda765f-fc57-5604-a269-52a7df8164ec")).toEqual(true);
		expect(check6("a9030619-8514-6970-e0f9-81b9ceb08a5f")).toEqual(true);

		expect(check1("45745C60-7B1A-11E8-9C9C-2D42B21B1A3E")).toEqual(true);
		expect(check2("9A7B330A-A736-21E5-AF7F-FEAF819CDC9F")).toEqual(true);
		expect(check3("9125A8DC-52EE-365B-A5AA-81B0B3681CF6")).toEqual(true);
		expect(check4("10BA038E-48DA-487B-96E8-8D3B99B6D18A")).toEqual(true);
		expect(check5("FDDA765F-FC57-5604-A269-52A7DF8164EC")).toEqual(true);
		expect(check6("A9030619-8514-6970-E0F9-81B9CEB08A5F")).toEqual(true);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "uuid"
		};
		const clonedSchema = {...schema};
		const check = v.compile(schema);

		expect(clonedSchema).toEqual(schema);

		let message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);

		message = "The '' field must be a valid UUID.";
		expect(check("")).toEqual([{ type: "uuid", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "uuid", actual: "true", message }]);
		expect(check("10000000-0000-0000-0000-000000000000")).toEqual([{ type: "uuid", actual: "10000000-0000-0000-0000-000000000000", message }]);
		expect(check("1234567-1234-1234-1234-1234567890ab")).toEqual([{ type: "uuid", actual: "1234567-1234-1234-1234-1234567890ab", message }]);
		expect(check("12345678-1234-1234-1234-1234567890ab")).toEqual(true);
	});
});
