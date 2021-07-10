import Validator, { RuleObject } from '../../../';

const v = new Validator();

describe('TypeScript Definitions', () => {
	describe('Test rule: object', () => {

		it('should check values', () => {
			const check = v.compile({ $$root: true, type: 'object' });
			const message = 'The \'\' must be an Object.';

			expect(check(0)).toEqual([{ type: 'object', actual: 0, message }]);
			expect(check(1)).toEqual([{ type: 'object', actual: 1, message }]);
			expect(check('')).toEqual([{ type: 'object', actual: '', message }]);
			expect(check(false)).toEqual([{ type: 'object', actual: false, message }]);
			expect(check(true)).toEqual([{ type: 'object', actual: true, message }]);
			expect(check([])).toEqual([{ type: 'object', actual: [], message }]);
			expect(check({})).toEqual(true);
			expect(check({ a: 'John' })).toEqual(true);
		});

		it('should check strict object', () => {
			const check = v.compile({ $$root: true, type: 'object', strict: true, properties: {} } as RuleObject);
			expect(check({})).toEqual(true);
			expect(check({ a: 'John' })).toEqual([{ type: 'objectStrict', actual: 'a', expected: '', message: 'The object \'\' contains forbidden keys: \'a\'.' }]);
		});

		it('should check strict object #2', () => {
			const check = v.compile({
				$$root: true, type: 'object', strict: true, props: {
					a: { type: 'string', trim: true },
				},
			} as RuleObject);
			expect(check({ a: 'John', b: 'Doe' })).toEqual([{ type: 'objectStrict', actual: 'b', expected: 'a', message: 'The object \'\' contains forbidden keys: \'b\'.' }]);

			const o = { a: '    John' };
			expect(check(o)).toEqual(true);
			expect(o.a).toBe('John');
		});

		it('should work with safe property name', () => {
			const check = v.compile({
				$$root: true, type: 'object', properties: {
					'read-only': 'boolean',
					'op.tional': { type: 'string', optional: true },
				},
			} as RuleObject);
			expect(check({})).toEqual([{ type: 'required', field: 'read-only', actual: undefined, message: 'The \'read-only\' field is required.' }]);
			expect(check({ 'read-only': false })).toEqual(true);
		});

		it('should work with nested fields', () => {
			const check = v.compile({
				user: {
					type: 'object', properties: {
						firstName: 'string',
						address: {
							type: 'object', properties: {
								country: 'string',
								city: 'string',
							},
						},
					},
				},
			});
			expect(check({ user: { firstName: 'John', address: { country: 'UK' } } })).
				toEqual([{ type: 'required', field: 'user.address.city', actual: undefined, message: 'The \'user.address.city\' field is required.' }]);
		});

		describe('Test sanitization', () => {

			it('should remove additional fields if \'strict: \'remove\'\'', () => {
				let schema = {
					name: { type: 'string' },
					address: {
						type: 'object', strict: 'remove', properties: {
							country: 'string',
							city: 'string',
						},
					},
				};
				let check = v.compile(schema);

				const obj = {
					name: 'John',
					address: {
						country: 'Hungary',
						city: 'Budapest',
						street: 'Kossuth Lajos street',
						zip: 1234,
					},
				};

				expect(check(obj)).toEqual(true);
				expect(obj).toEqual({
					name: 'John',
					address: {
						country: 'Hungary',
						city: 'Budapest',
					},
				});
			});

		});
	});
});
