"use strict";

const Validator = require("../../lib/validator");
const fn = require("../../lib/rules/uuid");

const v = new Validator();
const check = fn.bind(v);

describe("Test checkUUID", () => {

	it("should check type of value", () => {
		const uuid = {type: "uuid"};
		const err = {type: "uuid"};
		const errString = {type: "string"};

		expect(check(null, uuid)).toEqual(errString);
		expect(check(undefined, uuid)).toEqual(errString);
		expect(check(0, uuid)).toEqual(errString);
		expect(check(1, uuid)).toEqual(errString);
		expect(check("", uuid)).toEqual(err);
		expect(check("true", uuid)).toEqual(err);
		expect(check([], uuid)).toEqual(errString);
		expect(check({}, uuid)).toEqual(errString);
		expect(check(false, uuid)).toEqual(errString);
		expect(check(true, uuid)).toEqual(errString);
		expect(check("00000000-0000-0000-0000-000000000000", uuid)).toEqual(err);
		expect(check("1234567-1234-1234-1234-1234567890ab", uuid)).toEqual(err);
		expect(check("12345678-1234-1234-1234-1234567890ab", uuid)).toEqual(true);
	});

	it("check invalid version", () => {
		const err = {type: "uuid"};
		const v1 = {type: "uuid", version: 1};
		const v2 = {type: "uuid", version: 2};
		const v3 = {type: "uuid", version: 3};
		const v4 = {type: "uuid", version: 4};
		const v5 = {type: "uuid", version: 5};

		expect(check("00000000-0000-7000-0000-000000000000", err)).toEqual(err);
		expect(check("fdda765f-fc57-5604-c269-52a7df8164ec", v5)).toEqual(err);
		expect(check("9a7b330a-a736-51e5-af7f-feaf819cdc9f", v1)).toEqual({"actual": 5, "expected": 1, "type": "uuidVersion"});
		expect(check("9a7b330a-a736-51e5-af7f-feaf819cdc9f", v1)).toEqual({"actual": 5, "expected": 1, "type": "uuidVersion"});
		expect(check("9a7b330a-a736-41e5-af7f-feaf819cdc9f", v2)).toEqual({"actual": 4, "expected": 2, "type": "uuidVersion"});
		expect(check("9a7b330a-a736-41e5-af7f-feaf819cdc9f", v3)).toEqual({"actual": 4, "expected": 3, "type": "uuidVersion"});
		expect(check("9a7b330a-a736-21e5-af7f-feaf819cdc9f", v4)).toEqual({"actual": 2, "expected": 4, "type": "uuidVersion"});
		expect(check("9a7b330a-a736-11e5-af7f-feaf819cdc9f", v5)).toEqual({"actual": 1, "expected": 5, "type": "uuidVersion"});
	});

	it("check valid version", () => {
		const v1 = {type: "uuid", version: 1};
		const v2 = {type: "uuid", version: 2};
		const v3 = {type: "uuid", version: 3};
		const v4 = {type: "uuid", version: 4};
		const v5 = {type: "uuid", version: 5};

		expect(check("45745c60-7b1a-11e8-9c9c-2d42b21b1a3e", v1)).toEqual(true);
		expect(check("9a7b330a-a736-21e5-af7f-feaf819cdc9f", v2)).toEqual(true);
		expect(check("9125a8dc-52ee-365b-a5aa-81b0b3681cf6", v3)).toEqual(true);
		expect(check("10ba038e-48da-487b-96e8-8d3b99b6d18a", v4)).toEqual(true);
		expect(check("fdda765f-fc57-5604-a269-52a7df8164ec", v5)).toEqual(true);

	});
});
