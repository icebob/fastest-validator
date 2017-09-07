
const flatten = require("../../lib/helpers/flatten");

describe("flatten", () => {
	it("should return a flat array", () => {
		const result = flatten([0, [1, 1], 2, [3, 3, [4, [5, 6]], [[[[7]]], [8]], [9]], [10, [[11], 12]], 13]);
		expect(result.length).toEqual(16);
		expect(result).toEqual([0, 1, 1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
	});
});
