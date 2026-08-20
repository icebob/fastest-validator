
const deepExtend = require("../../lib/helpers/deep-extend");

describe("deepExtend", () => {
	it("should return a merged object", () => {
		const result = deepExtend({
			a: {
				b: 5,
				c: 6
			},
			d: true,
			j: [],
			k: [1,2],
		}, {
			a: {
				b: 10,
				e: "Hello"
			},
			f: "F",
			g: {
				h: "H"
			},
			j: "some",
			k: [5,6],
			l: [1,2],
			r: /s/,
			o: {}
		});
		expect(result).toEqual({
			a: {
				b: 10,
				c: 6,
				e: "Hello"
			},
			d: true,
			f: "F",
			g: {
				h: "H"
			},
			j: "some",
			k: [5,6],
			l: [1,2],
			r: /s/,
			o: {}
		});
	});
});

describe("Test merge options", () => {
	it("should consider skipIfExist option and not overwrite the existing properties", () => {
		const result = deepExtend({
			b: 5,
			c: 6
		}, {
			b: 10,
			e: "Hello"
		}, { skipIfExist: true });

		expect(result).toEqual({
			b: 5,
			c: 6,
			e: "Hello"
		});
	});
});

describe("deepExtend prototype-pollution protection", () => {
	it("does not pollute Object.prototype via a __proto__ key", () => {
		deepExtend({}, JSON.parse("{\"__proto__\": {\"polluted_via_deepextend\": true}}"));
		expect({}).not.toHaveProperty("polluted_via_deepextend");
		expect(Object.prototype.polluted_via_deepextend).toBeUndefined();
	});

	it("does not write constructor or prototype keys onto the destination", () => {
		const dest = {};
		deepExtend(dest, JSON.parse("{\"constructor\": {\"polluted_constructor\": true}, \"prototype\": {\"polluted_prototype\": true}}"));
		expect({}).not.toHaveProperty("polluted_constructor");
		expect({}).not.toHaveProperty("polluted_prototype");
		expect(dest.constructor).toBe(Object);
	});

	it("still merges legitimate nested objects and business keys", () => {
		const result = deepExtend({ a: { b: 1 } }, { a: { c: 2 }, d: { e: 3 } });
		expect(result).toEqual({ a: { b: 1, c: 2 }, d: { e: 3 } });
	});
});
