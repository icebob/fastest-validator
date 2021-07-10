import Validator, { RuleArray } from '../../../';

const v = new Validator();

describe('TypeScript Definitions', () => {
	describe('Test rule: array', () => {

		it('should check type of value', () => {
			const check = v.compile({ $$root: true, type: 'array' });
			const message = 'The \'\' field must be an array.';

			expect(check(0)).toEqual([{ type: 'array', actual: 0, message }]);
			expect(check(1)).toEqual([{ type: 'array', actual: 1, message }]);
			expect(check({})).toEqual([{ type: 'array', actual: {}, message }]);
			expect(check(false)).toEqual([{ type: 'array', actual: false, message }]);
			expect(check(true)).toEqual([{ type: 'array', actual: true, message }]);
			expect(check('')).toEqual([{ type: 'array', actual: '', message }]);
			expect(check('test')).toEqual([{ type: 'array', actual: 'test', message }]);

			expect(check([])).toEqual(true);
		});

		it('check empty values', () => {
			const check = v.compile({ $$root: true, type: 'array', empty: false });

			expect(check([1])).toEqual(true);
			expect(check([])).toEqual([{ type: 'arrayEmpty', actual: [], message: 'The \'\' field must not be an empty array.' }]);
		});

		it('check min length', () => {
			const check = v.compile({ $$root: true, type: 'array', min: 3 } as RuleArray);

			expect(check([])).toEqual([{ type: 'arrayMin', expected: 3, actual: 0, message: 'The \'\' field must contain at least 3 items.' }]);
			expect(check([5, 7])).toEqual([{ type: 'arrayMin', expected: 3, actual: 2, message: 'The \'\' field must contain at least 3 items.' }]);
			expect(check(['a', 'b', 'c'])).toEqual(true);
			expect(check([1, 2, 3, 4, 5])).toEqual(true);
		});

		it('check max length', () => {
			const check = v.compile({ $$root: true, type: 'array', max: 3 } as RuleArray);

			expect(check([1, 2, 3, 4])).toEqual([{ type: 'arrayMax', expected: 3, actual: 4, message: 'The \'\' field must contain less than or equal to 3 items.' }]);
			expect(check(['a', 'b', 'c'])).toEqual(true);
			expect(check([1])).toEqual(true);
			expect(check([])).toEqual(true);
		});

		it('check fix length', () => {
			const check = v.compile({ $$root: true, type: 'array', length: 2 } as RuleArray);

			expect(check([1, 2, 3, 4])).toEqual([{ type: 'arrayLength', expected: 2, actual: 4, message: 'The \'\' field must contain 2 items.' }]);
			expect(check([1])).toEqual([{ type: 'arrayLength', expected: 2, actual: 1, message: 'The \'\' field must contain 2 items.' }]);
			expect(check([])).toEqual([{ type: 'arrayLength', expected: 2, actual: 0, message: 'The \'\' field must contain 2 items.' }]);
			expect(check(['a', 'b'])).toEqual(true);
		});

		it('check contains', () => {
			const check = v.compile({ $$root: true, type: 'array', contains: 'bob' });

			expect(check([])).toEqual([{ type: 'arrayContains', expected: 'bob', actual: [], message: 'The \'\' field must contain the \'bob\' item.' }]);
			expect(check(['john'])).toEqual([{ type: 'arrayContains', expected: 'bob', actual: ['john'], message: 'The \'\' field must contain the \'bob\' item.' }]);
			expect(check(['john', 'bob'])).toEqual(true);
		});

		it('check contains with numbers', () => {
			const check = v.compile({ $$root: true, type: 'array', contains: 5 } as RuleArray);

			expect(check([])).toEqual([{ type: 'arrayContains', expected: 5, actual: [], message: 'The \'\' field must contain the \'5\' item.' }]);
			expect(check([3, 7])).toEqual([{ type: 'arrayContains', expected: 5, actual: [3, 7], message: 'The \'\' field must contain the \'5\' item.' }]);
			expect(check([8, 5, 2])).toEqual(true);
		});

		it('check enum', () => {
			const check = v.compile({ $$root: true, type: 'array', enum: ['male', 'female'] } as RuleArray);

			expect(check(['human'])).
				toEqual(
					[{ type: 'arrayEnum', actual: 'human', expected: 'male, female', message: 'The \'human\' value in \'\' field does not match any of the \'male, female\' values.' }]);
			expect(check(['male'])).toEqual(true);
			expect(check(['male', 'female'])).toEqual(true);
			expect(check(['male', 'female', 'human'])).
				toEqual(
					[{ type: 'arrayEnum', actual: 'human', expected: 'male, female', message: 'The \'human\' value in \'\' field does not match any of the \'male, female\' values.' }]);
		});

		it('check items', () => {
			const check = v.compile({ $$root: true, type: 'array', items: 'string' });

			expect(check([])).toEqual(true);
			expect(check(['human'])).toEqual(true);
			expect(check(['male', 3, 'female', true])).toEqual([
				{ type: 'string', field: '[1]', actual: 3, message: 'The \'[1]\' field must be a string.' },
				{ type: 'string', field: '[3]', actual: true, message: 'The \'[3]\' field must be a string.' },
			]);
		});
	});

	describe("Test sanitization", () => {

		it("should untouch the checked obj", () => {
			let schema = {
				roles: { type: "array" } as RuleArray
			};
			let check = v.compile(schema);

			const obj = {
				roles: ["admin", "user", "moderator"]
			};

			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({
				roles: ["admin", "user", "moderator"]
			});
		});

		it("should trim all items", () => {
			let schema = {
				roles: { type: "array", items: "string|trim" } as RuleArray
			};
			let check = v.compile(schema);

			const obj = {
				roles: ["  admin", "user   ", "  moderator  "]
			};

			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({
				roles: ["admin", "user", "moderator"]
			});
		});

	});
});
