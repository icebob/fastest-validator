"use strict";

const msg = require("../lib/messages");

describe("Test Messages", () => {

	it("check default messages", () => {
		expect(msg.required).toBe("The '{field}' field is required.");

		expect(msg.required).toBeDefined();
		expect(msg.string).toBeDefined();
		expect(msg.stringEmpty).toBeDefined();
		expect(msg.stringMin).toBeDefined();
		expect(msg.stringMax).toBeDefined();
		expect(msg.stringLength).toBeDefined();
		expect(msg.stringPattern).toBeDefined();
		expect(msg.stringContains).toBeDefined();
		expect(msg.stringEnum).toBeDefined();
		expect(msg.number).toBeDefined();
		expect(msg.numberMin).toBeDefined();
		expect(msg.numberMax).toBeDefined();
		expect(msg.numberEqual).toBeDefined();
		expect(msg.numberNotEqual).toBeDefined();
		expect(msg.numberInteger).toBeDefined();
		expect(msg.numberPositive).toBeDefined();
		expect(msg.numberNegative).toBeDefined();
		expect(msg.array).toBeDefined();
		expect(msg.arrayEmpty).toBeDefined();
		expect(msg.arrayMin).toBeDefined();
		expect(msg.arrayMax).toBeDefined();
		expect(msg.arrayLength).toBeDefined();
		expect(msg.arrayContains).toBeDefined();
		expect(msg.arrayUnique).toBeDefined();
		expect(msg.arrayEnum).toBeDefined();
		expect(msg.tuple).toBeDefined();
		expect(msg.tupleEmpty).toBeDefined();
		expect(msg.tupleLength).toBeDefined();
		expect(msg.boolean).toBeDefined();
		expect(msg.function).toBeDefined();
		expect(msg.date).toBeDefined();
		expect(msg.dateMin).toBeDefined();
		expect(msg.dateMax).toBeDefined();
		expect(msg.forbidden).toBeDefined();
		expect(msg.email).toBeDefined();
		expect(msg.emailEmpty).toBeDefined();
		expect(msg.url).toBeDefined();
		expect(msg.urlEmpty).toBeDefined();
		expect(msg.enumValue).toBeDefined();
		expect(msg.equalValue).toBeDefined();
		expect(msg.equalField).toBeDefined();
		expect(msg.object).toBeDefined();
		expect(msg.objectStrict).toBeDefined();
		expect(msg.uuid).toBeDefined();
		expect(msg.uuidVersion).toBeDefined();
		expect(msg.mac).toBeDefined();
		expect(msg.luhn).toBeDefined();

	});

});
