/// <reference path="../../index.d.ts" /> // here we make a reference to exists module definition
import Validator from '../../';

describe('TypeScript Definitions', () => {
	describe('Test constructor', () => {

		it('should create instance', () => {
			let v = new Validator();
			expect(v).toBeDefined();
			expect(v.messages).toBeDefined();
			expect(v.compile).toBeInstanceOf(Function);
			expect(v.validate).toBeInstanceOf(Function);
			expect(v.add).toBeInstanceOf(Function);

			expect(Object.keys(v.rules)).toHaveProperty('length', 22);
		});

		it('should create instance with custom messages', () => {
			let v = new Validator({
				messages: {
					numberMin: 'Custom validation error message',
				},
			});
			expect(v).toBeDefined();
			expect(v.messages).toBeDefined();
			expect(v.messages.numberMin).toBe('Custom validation error message');
			expect(v.messages.numberMax).toBe('The \'{field}\' field must be less than or equal to {expected}.');
		});

		it('should create multi instance with custom messages', () => {
			let v1 = new Validator({
				messages: {
					numberMin: 'Custom validation error message',
				},
			});
			let v2 = new Validator({
				messages: {
					numberMin: 'Egyedi hibaüzenet',
				},
			});
			expect(v1).toBeDefined();
			expect(v1.messages).toBeDefined();
			expect(v1.messages.numberMin).toBe('Custom validation error message');
			expect(v1.messages.numberMax).toBe('The \'{field}\' field must be less than or equal to {expected}.');

			expect(v2).toBeDefined();
			expect(v2.messages).toBeDefined();
			expect(v2.messages.numberMin).toBe('Egyedi hibaüzenet');
			expect(v2.messages.numberMax).toBe('The \'{field}\' field must be less than or equal to {expected}.');
		});

	});

	describe('Test validate', () => {

		const v = new Validator();
		const compiledFn = jest.fn(() => true);
		v.compile = jest.fn(() => compiledFn) as any;

		const schema = {
			name: { type: 'string' },
		};

		const obj = {
			name: 'John',
		};

		it('should call compile & compiled check function', () => {
			let res = v.validate(obj, schema);
			expect(res).toBe(true);
			expect(v.compile).toHaveBeenCalledTimes(1);
			expect(v.compile).toHaveBeenCalledWith(schema);

			expect(compiledFn).toHaveBeenCalledTimes(1);
			expect(compiledFn).toHaveBeenCalledWith(obj);
		});

	});

	describe('Test add', () => {
		let check;

		const v = new Validator({
			messages: {
				// Register our new error message text
				evenNumber: 'The \'{field}\' field must be an even number! Actual: {actual}',
			},
		});

		const validFn = jest.fn(function (this: Validator, { messages }) {
			return {
				source: `
				if (value % 2 != 0)
					${this.makeError({ type: 'evenNumber', actual: 'value', messages })}

				return value;
			`,
			};
		});

		it('should not contain the new validator', () => {
			expect((v.rules as any).even).toBeUndefined();
		});

		it('should contain the new validator', () => {
			v.add('even', validFn);
			expect(v.rules.even).toBeDefined();
		});

		it('should call the new validator', () => {
			const schema = {
				a: { type: 'even' },
			};

			check = v.compile(schema);

			const context = expect.objectContaining({
				customs: expect.any(Object),
				rules: expect.any(Array),
				fn: expect.any(Array),
				index: 2,
				async: false
			});

			expect(validFn).toHaveBeenCalledTimes(1);
			expect(validFn).toHaveBeenCalledWith(expect.any(Object), 'a', context);
		});

		it('should check the new rule', () => {
			expect(check({ a: 5 })).toEqual([{ 'type': 'evenNumber', 'field': 'a', 'actual': 5, 'message': 'The \'a\' field must be an even number! Actual: 5' }]);
			expect(check({ a: 6 })).toEqual(true);
		});

	});

	describe('Test getRuleFromSchema method', () => {

		const v = new Validator();

		it('should convert array to multi rule', () => {
			const res = v.getRuleFromSchema([
				'string',
				'number',
			]);
			expect(res.schema).toEqual({ type: 'multi', rules: ['string', 'number'] });
		});

		it('should throw error is the schema is null', () => {
			expect(() => {
				(v as any).compile();
			}).toThrowError('Invalid schema.');

			expect(() => {
				(v as any).compile(null);
			}).toThrowError('Invalid schema.');

			expect(() => {
				(v as any).compile('Nothing');
			}).toThrowError('Invalid schema.');

			expect(() => {
				(v as any).compile(1);
			}).toThrowError('Invalid schema.');
		});

		it('should throw error is the schema array element count is zero', () => {
			expect(() => {
				v.compile([]);
			}).toThrowError();
		});

		it('should throw error if the type is invalid', () => {
			expect(() => {
				v.compile({ id: { type: 'unknow' } });
			}).toThrowError('Invalid \'unknow\' type in validator schema.');
		});

		it('should throw error if object has string props', () => {
			const schema = {
				invalid: { type: 'object', props: 'string' },
			};

			expect(() => {
				v.compile(schema);
			}).toThrowError('Invalid \'s\' type in validator schema.');
		});

		describe('Test string shorthard rules', () => {

			it('should convert only type', () => {
				const res = v.getRuleFromSchema('string');
				expect(res.schema).toEqual({ type: 'string' });
			});

			it('should convert with properties', () => {
				const res = v.getRuleFromSchema('string|min:3 | max : 10| trim');
				expect(res.schema).toEqual({ type: 'string', min: 3, max: 10, trim: true });
			});

			it('should convert with disabled properties', () => {
				const res = v.getRuleFromSchema('string|no-empty|trim:true|alpha:false|some:1234kg');
				expect(res.schema).toEqual({ type: 'string', empty: false, alpha: false, trim: true, some: '1234kg' });
			});

		});

		describe("Test object shorthand rule ($$type)", () => {
			it("should convert", () => {
				const res = v.getRuleFromSchema({
					$$type: "object",
					name: { type: "string" },
					age: { type: "number" }
				});

				expect(res.schema).toEqual({
					type: "object",
					props: {
						name: { type: "string" },
						age: { type: "number" }
					}
				});
			});
		});
	});

	describe('Test makeError', () => {

		const v = new Validator();

		it('should generate an error creation code', () => {
			expect(v.makeError({ type: 'required', messages: v.messages })).
				toBe('errors.push({ type: "required", message: "The \'{field}\' field is required.", field: field });');
			expect(v.makeError({ type: 'stringMin', field: 'firstName', expected: 6, actual: 3, messages: v.messages })).
				toBe(
					'errors.push({ type: "stringMin", message: "The \'{field}\' field length must be greater than or equal to {expected} characters long.", field: "firstName", expected: 6, actual: 3 });');
		});

	});

	describe('Test compile (integration test)', () => {

		describe('Test check generator with wrong obj', () => {

			const v = new Validator();

			const schema = {
				id: { type: 'number' },
				name: { type: 'string', min: 5, optional: true },
				password: { type: 'forbidden' },
			};

			let check = v.compile(schema);

			it('should give back one errors', () => {
				let res = check({ id: 5, name: 'John' });
				expect(res).toBeInstanceOf(Array);

				expect(res).toHaveProperty('length', 1);
				expect(res[0]).toEqual({
					type: 'stringMin',
					field: 'name',
					message: 'The \'name\' field length must be greater than or equal to 5 characters long.',
					expected: 5,
					actual: 4,
				});
			});

			it('should give back more errors', () => {
				let res = check({ password: '123456' });
				expect(res).toBeInstanceOf(Array);

				expect(res).toHaveProperty('length', 2);
				expect(res[0].type).toBe('required');
				expect(res[1].type).toBe('forbidden');
			});

		});

		/*
		describe("Test check generator with custom path & parent", () => {

			it("when schema is defined as an array, and custom path & parent are specified, they should be forwarded to validators", () => {
				const v = new Validator();
				const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
				v.add("customValidator", customValidator);

				const validate = v.compile([{ type: "customValidator" }]);
				const parent = {};
				const res = validate({ customValue: 4711 }, "customPath", parent);

				expect(res).toBe(true);
				expect(customValidator.mock.calls[0][2]).toBe("customPath");
				expect(customValidator.mock.calls[0][3]).toBe(parent);
			});

			it("when schema is defined as an array, path & parent should be set to default values in validators", () => {
				const v = new Validator();
				const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
				v.add("customValidator", customValidator);

				const validate = v.compile([{ type: "customValidator" }]);
				const res = validate({ customValue: 4711 });

				expect(res).toBe(true);
				expect(customValidator.mock.calls[0][2]).toBeUndefined();
				expect(customValidator.mock.calls[0][3]).toBeNull();
			});

			it("when schema is defined as an object, and custom path is specified, it should be forwarded to validators", () => {
				// Note: as the item we validate always must be an object, there is no use
				// of specifying a custom parent, like for the schema-as-array above.
				// The parent is currently used in the validator code (only forwarded to the generated
				// function that validates all properties) and there is no way to test it.
				const v = new Validator();
				const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
				v.add("customValidator", customValidator);

				const validate = v.compile({ customValue: { type: "customValidator" } });
				const res = validate({ customValue: 4711 }, "customPath");

				expect(res).toBe(true);
				expect(customValidator.mock.calls[0][2]).toBe("customPath.customValue");
			});

			it("when schema is defined as an object, path should be set to default value in validators", () => {
				const v = new Validator();
				const customValidator = jest.fn().mockReturnValue(true);	// Will be called with (value, schema, path, parent)
				v.add("customValidator", customValidator);

				const validate = v.compile({ customValue: { type: "customValidator" } });
				const res = validate({ customValue: 4711 });

				expect(res).toBe(true);
				expect(customValidator.mock.calls[0][2]).toBe("customValue");
			});
		}); */
	});
});
