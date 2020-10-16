"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();
const { ObjectID } = require("mongodb");

describe("Test rule: objectID", () => {

	it("should validate ObjectID", () => {
		const check = v.compile({ id: { type: "objectID", ObjectID } });
		const message = "The 'id' field must be an valid ObjectID";

		expect(check({ id: "5f082780b00cc7401fb8"})).toEqual([{ type: "objectID", field: "id", actual: "5f082780b00cc7401fb8", message }]);
		expect(check({ id: new ObjectID() })).toEqual(true);

		const o = { id: "5f082780b00cc7401fb8e8fc" };
		expect(check(o)).toEqual(true);
		expect(o.id).toBe("5f082780b00cc7401fb8e8fc");
	});

	it("should convert hexString-objectID to ObjectID", () => {
		const check = v.compile({ id: { type: "objectID", ObjectID, convert: true } });
		const  oid = new ObjectID();
		const o = { id: oid.toHexString() };

		expect(check(o)).toEqual(true);
		expect(o.id).toBeInstanceOf(ObjectID);
		expect(o.id).toEqual(oid);
	});

	it("should convert hexString-objectID to hexString", () => {
		const check = v.compile({ id: { type: "objectID", ObjectID, convert: "hexString" } });
		const  oid = new ObjectID();
		const  oidStr = oid.toHexString();
		const o = { id: oid };

		expect(check({ id: oidStr })).toEqual(true);
		expect(check(o)).toEqual(true);
		expect(o.id).toEqual(oidStr);
	});

	it("should catch hexString problems when convert: true", () => {
		const message = "The 'id' field must be an valid ObjectID";
		const check = v.compile({ id: { type: "objectID", ObjectID, convert: true } });

		const badID = "5f082780b00cc7401fb8";
		const o = { id: badID };
		expect(check(o)).toEqual([{ type: "objectID", field: "id", actual: badID, message }]);
	});
});
