"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: mac", () => {

	it("should check type of value", () => {
		const check = v.compile({ $$root: true, type: "mac" });
		let message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);

		message = "The '' field must be a valid MAC address.";
		expect(check("")).toEqual([{ type: "mac", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "mac", actual: "true", message }]);
		expect(check("018.954B.65FE")).toEqual([{ type: "mac", actual: "018.954B.65FE", message }]);
		expect(check("01C8.95B.65FE")).toEqual([{ type: "mac", actual: "01C8.95B.65FE", message }]);
		expect(check("01C8.954B.6FE")).toEqual([{ type: "mac", actual: "01C8.954B.6FE", message }]);
		expect(check("1-C8-95-4B-65-FE")).toEqual([{ type: "mac", actual: "1-C8-95-4B-65-FE", message }]);
		expect(check("01-C8-95-4B-65-F")).toEqual([{ type: "mac", actual: "01-C8-95-4B-65-F", message }]);
		expect(check("01-C8-95-4B-65-FE-A0")).toEqual([{ type: "mac", actual: "01-C8-95-4B-65-FE-A0", message }]);
		expect(check("1:C8:95:4B:65:FE")).toEqual([{ type: "mac", actual: "1:C8:95:4B:65:FE", message }]);
		expect(check("01:8:95:4B:65:FE")).toEqual([{ type: "mac", actual: "01:8:95:4B:65:FE", message }]);
		expect(check("01:C8:95:4B:65:F")).toEqual([{ type: "mac", actual: "01:C8:95:4B:65:F", message }]);
		expect(check("01:C8:95:4B:65:FE:AF")).toEqual([{ type: "mac", actual: "01:C8:95:4B:65:FE:AF", message }]);
		expect(check("01:c8:95:4b:65:fe")).toEqual(true);
		expect(check("01:C8:95:4B:65:FE")).toEqual(true);
		expect(check("01c8.954b.65fe")).toEqual(true);
		expect(check("01C8.954B.65FE")).toEqual(true);
		expect(check("01-C8-95-4B-65-FE")).toEqual(true);
		expect(check("01-c8-95-4b-65-fe")).toEqual(true);
	});

	it("should allow custom metas", async () => {
		const schema = {
			$$foo: {
				foo: "bar"
			},
			$$root: true,
			type: "mac"
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

		message = "The '' field must be a valid MAC address.";
		expect(check("")).toEqual([{ type: "mac", actual: "", message }]);
		expect(check("true")).toEqual([{ type: "mac", actual: "true", message }]);
		expect(check("018.954B.65FE")).toEqual([{ type: "mac", actual: "018.954B.65FE", message }]);
		expect(check("01C8.95B.65FE")).toEqual([{ type: "mac", actual: "01C8.95B.65FE", message }]);
		expect(check("01C8.954B.6FE")).toEqual([{ type: "mac", actual: "01C8.954B.6FE", message }]);
		expect(check("1-C8-95-4B-65-FE")).toEqual([{ type: "mac", actual: "1-C8-95-4B-65-FE", message }]);
		expect(check("01-C8-95-4B-65-F")).toEqual([{ type: "mac", actual: "01-C8-95-4B-65-F", message }]);
		expect(check("01-C8-95-4B-65-FE-A0")).toEqual([{ type: "mac", actual: "01-C8-95-4B-65-FE-A0", message }]);
		expect(check("1:C8:95:4B:65:FE")).toEqual([{ type: "mac", actual: "1:C8:95:4B:65:FE", message }]);
		expect(check("01:8:95:4B:65:FE")).toEqual([{ type: "mac", actual: "01:8:95:4B:65:FE", message }]);
		expect(check("01:C8:95:4B:65:F")).toEqual([{ type: "mac", actual: "01:C8:95:4B:65:F", message }]);
		expect(check("01:C8:95:4B:65:FE:AF")).toEqual([{ type: "mac", actual: "01:C8:95:4B:65:FE:AF", message }]);
		expect(check("01:c8:95:4b:65:fe")).toEqual(true);
		expect(check("01:C8:95:4B:65:FE")).toEqual(true);
		expect(check("01c8.954b.65fe")).toEqual(true);
		expect(check("01C8.954B.65FE")).toEqual(true);
		expect(check("01-C8-95-4B-65-FE")).toEqual(true);
		expect(check("01-c8-95-4b-65-fe")).toEqual(true);
	});
});
