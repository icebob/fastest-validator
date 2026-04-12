import Validator, { ValidationSchema } from '../../../';

const v = new Validator();

describe('TypeScript Definitions', () => {
	describe('Test custom messages', () => {
		it('should give back not a string message', () => {
			const message = "That wasn't a string!";
			const s = {
				name: { type: 'string', messages: { string: message } }
			} satisfies ValidationSchema;

			expect(v.validate({ name: 123 }, s)).toEqual([{ type: 'string', actual: 123, field: 'name', message }]);
		});

		it('should give back required message', () => {
			const message = 'Your name is required!';
			const s = {
				name: { type: 'string', messages: { required: message } }
			} satisfies ValidationSchema;

			expect(v.validate({}, s)).toEqual([{ type: 'required', actual: undefined, field: 'name', message }]);
		});

		it('should do replacements in custom messages', () => {
			const message = 'Incorrect name length. Your field: {field} had {actual} chars when it should have no more than {expected}';
			const s = {
				name: {
					type: 'string',
					max: 2,
					messages: { stringMax: message }
				}
			} satisfies ValidationSchema;

			expect(v.validate({ name: 'Long string' }, s)).toEqual([
				{
					type: 'stringMax',
					expected: 2,
					actual: 11,
					field: 'name',
					message: 'Incorrect name length. Your field: name had 11 chars when it should have no more than 2',
				}]);

		});

		it('should do custom messages in arrays', () => {
			const s = {
				cache: [
					{ type: 'string', messages: { string: 'Not a string' } },
					{ type: 'boolean', messages: { boolean: 'Not a boolean' } }
				],
			} satisfies ValidationSchema;

			expect(v.validate({ cache: 123 }, s)).toEqual([
				{ type: 'string', field: 'cache', actual: 123, message: 'Not a string' },
				{ type: 'boolean', field: 'cache', actual: 123, message: 'Not a boolean' },
			]);

			expect(v.validate({ cache: true }, s)).toEqual(true);
			expect(v.validate({ cache: 'hello' }, s)).toEqual(true);
		});

		it('should do custom messages in objects', () => {
			const s = {
				users: {
					type: 'array',
					items: {
						type: 'object',
						props: {
							id: { type: 'number', positive: true, messages: { 'number': 'numbers only please' } },
							name: { type: 'string', empty: false, messages: { 'string': 'make sure it\'s a string' } },
							status: 'boolean',
						},
					},
				},
			} satisfies ValidationSchema;

			expect(
				v.validate({
						users: [
							{ id: 'test', name: 'John', status: true },
							{ id: 2, name: 123, status: true },
							{ id: 3, name: 'Bill', status: false },
						],
					}, s)).toEqual([
				{ type: 'number', field: 'users[0].id', actual: 'test', message: 'numbers only please' },
				{ type: 'string', field: 'users[1].name', actual: 123, message: 'make sure it\'s a string' },
			]);

		});

		it('should do custom messages when compiled', () => {
			const s = {
				users: {
					type: 'array',
					items: {
						type: 'object',
						props: {
							id: { type: 'number', positive: true, messages: { 'number': 'numbers only please' } },
							name: { type: 'string', empty: false, messages: { 'string': 'make sure it\'s a string' } },
							status: 'boolean',
						},
					},
				},
			} satisfies ValidationSchema;

			const check = v.compile(s);

			expect(
				check({
					users: [
						// @ts-expect-error
						{ id: 'test', name: 'John', status: true },
						// @ts-expect-error
						{ id: 2, name: 123, status: true },
						{ id: 3, name: 'Bill', status: false }
					],
				})).toEqual([
					{ type: 'number', field: 'users[0].id', actual: 'test', message: 'numbers only please' },
					{ type: 'string', field: 'users[1].name', actual: 123, message: 'make sure it\'s a string' },
			]);

		});
	});
});
