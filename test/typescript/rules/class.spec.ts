/// <reference path="../../../index.d.ts" /> // here we make a reference to exists module definition
import ValidatorType from 'fastest-validator'; // here we importing type definition of default export

const Validator: typeof ValidatorType = require('../../../index'); // here we importing real Validator Constructor
const v: ValidatorType = new Validator();

describe("Test rule: class", () => {

	it("should value instanceOf Buffer", () => {
		const check = v.compile({ rawData: { type: "class", instanceOf: Buffer } });
		const message = "The 'rawData' field must be an instance of the 'Buffer' class.";

		expect(check({ rawData: "1234"})).toEqual([{ type: "classInstanceOf", field: "rawData", actual: "1234", expected: "Buffer", message }]);
		expect(check({ rawData: [1, 2, 3]})).toEqual([{ type: "classInstanceOf", field: "rawData", actual: [1, 2, 3], expected: "Buffer", message }]);
		expect(check({ rawData: Buffer.from([1, 2, 3]) })).toEqual(true);
		expect(check({ rawData: Buffer.alloc(3) })).toEqual(true);
	});
});
