/// <reference path="../../../index.d.ts" /> // here we make a reference to exists module definition
import ValidatorType, { RuleCustom, ValidationSchema } from 'fastest-validator'; // here we importing type definition of default export

const Validator: typeof ValidatorType = require('../../../index'); // here we importing real Validator Constructor
const v: ValidatorType = new Validator();

describe('TypeScript Definitions', () => {
    describe('Test rule: custom', () => {

        it('should call custom checker', () => {
            const checker = jest.fn(() => true);
            const schema: ValidationSchema = { $$root: true, type: 'custom', a: 5, check: checker } as RuleCustom;
            const check = v.compile(schema);

            expect(check(10)).toEqual(true);
            expect(checker).toHaveBeenCalledTimes(1);
            expect(checker).toHaveBeenCalledWith(10, [], schema, 'null', null, expect.any(Object));
        });

        it('should call custom checker', () => {
            const checker = jest.fn((v) => v);
            const schema = { weight: { type: 'custom', a: 5, check: checker } };
            const check = v.compile(schema);

            expect(check({ weight: 10 })).toEqual(true);
            expect(checker).toHaveBeenCalledTimes(1);
            expect(checker).toHaveBeenCalledWith(10, [], schema.weight, 'weight', { weight: 10 }, expect.any(Object));
        });

        it('should handle returned errors', () => {
            const checker = jest.fn(function (value, errors, schema, field) {
                errors.push({ type: 'myError', field, expected: 3, actual: 4 });
                return value
            });
            const schema = { weight: { type: 'custom', a: 5, check: checker, messages: { myError: 'My error message. Expected: {expected}, actual: {actual}, field: {field}' } } };
            const check = v.compile(schema);

            expect(check({ weight: 10 })).toEqual([
                {
                    type: 'myError',
                    field: 'weight',
                    actual: 4,
                    expected: 3,
                    message: 'My error message. Expected: 3, actual: 4, field: weight',
                }]);
            expect(checker).toHaveBeenCalledTimes(1);
            expect(checker).toHaveBeenCalledWith(10, expect.any(Array), schema.weight, 'weight', { weight: 10 }, expect.any(Object));
        });
    });
});
