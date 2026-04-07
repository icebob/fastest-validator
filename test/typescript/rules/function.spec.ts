import Validator from '../../../';

const v = new Validator();

describe('TypeScript Definitions', () => {
	describe('Test rule: function', () => {

		it('should check values', () => {
			const check = v.compile({ $$root: true, type: 'function' });
			const message = 'The \'\' field must be a function.';

			// @ts-expect-error
			expect(check(0)).toEqual([{ type: 'function', actual: 0, message }]);
			// @ts-expect-error
			expect(check(1)).toEqual([{ type: 'function', actual: 1, message }]);
			// @ts-expect-error
			expect(check('')).toEqual([{ type: 'function', actual: '', message }]);
			// @ts-expect-error
			expect(check('true')).toEqual([{ type: 'function', actual: 'true', message }]);
			// @ts-expect-error
			expect(check([])).toEqual([{ type: 'function', actual: [], message }]);
			// @ts-expect-error
			expect(check({})).toEqual([{ type: 'function', actual: {}, message }]);
			// @ts-expect-error
			expect(check(false)).toEqual([{ type: 'function', actual: false, message }]);
			// @ts-expect-error
			expect(check(true)).toEqual([{ type: 'function', actual: true, message }]);

			expect(check(function () { })).toEqual(true);
			expect(check(() => { })).toEqual(true);
			expect(check(new Function())).toEqual(true);
		});
	});
});
