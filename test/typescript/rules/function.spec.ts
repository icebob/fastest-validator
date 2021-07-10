import Validator from '../../../';

const v = new Validator();

describe('TypeScript Definitions', () => {
	describe('Test rule: function', () => {

		it('should check values', () => {
			const check = v.compile({ $$root: true, type: 'function' });
			const message = 'The \'\' field must be a function.';

			expect(check(0)).toEqual([{ type: 'function', actual: 0, message }]);
			expect(check(1)).toEqual([{ type: 'function', actual: 1, message }]);
			expect(check('')).toEqual([{ type: 'function', actual: '', message }]);
			expect(check('true')).toEqual([{ type: 'function', actual: 'true', message }]);
			expect(check([])).toEqual([{ type: 'function', actual: [], message }]);
			expect(check({})).toEqual([{ type: 'function', actual: {}, message }]);
			expect(check(false)).toEqual([{ type: 'function', actual: false, message }]);
			expect(check(true)).toEqual([{ type: 'function', actual: true, message }]);

			expect(check(function () { })).toEqual(true);
			expect(check(() => { })).toEqual(true);
			expect(check(new Function())).toEqual(true);
		});
	});
});
