import deepExtend from "../../lib/helpers/deep-extend";

describe("deepExtend", () => {
	it("should return a merged object", () => {
		const result = deepExtend({
			a: {
				b: 5,
				c: 6
			},
			d: true,
			j: [],
			k: [1,2]
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
			k: [5,6]
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
			k: [5,6]
		});
	});
});
