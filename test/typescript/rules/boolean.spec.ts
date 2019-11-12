/// <reference path="../../../index.d.ts" /> // here we make a reference to exists module definition
import ValidatorType, { ValidationSchema } from 'fastest-validator'; // here we importing type definition of default export

const Validator: typeof ValidatorType = require('../../../index'); // here we importing real Validator Constructor
const v: ValidatorType = new Validator();

describe('TypeScript Definitions', () => {
    describe('Test rule: boolean', () => {

        it('should check values', () => {
            const check = v.compile({ $$root: true, type: 'boolean' });
            const message = 'The \'\' field must be a boolean.';

            expect(check(0)).toEqual([{ type: 'boolean', actual: 0, message }]);
            expect(check(1)).toEqual([{ type: 'boolean', actual: 1, message }]);
            expect(check('')).toEqual([{ type: 'boolean', actual: '', message }]);
            expect(check('true')).toEqual([{ type: 'boolean', actual: 'true', message }]);
            expect(check('false')).toEqual([{ type: 'boolean', actual: 'false', message }]);
            expect(check([])).toEqual([{ type: 'boolean', actual: [], message }]);
            expect(check({})).toEqual([{ type: 'boolean', actual: {}, message }]);

            expect(check(false)).toEqual(true);
            expect(check(true)).toEqual(true);
        });

        it('should convert & check values', () => {
            const check = v.compile({ $$root: true, type: 'boolean', convert: true });
            const message = 'The \'\' field must be a boolean.';

            expect(check(0)).toEqual(true);
            expect(check(1)).toEqual(true);
            expect(check('')).toEqual([{ type: 'boolean', actual: '', message }]);
            expect(check('true')).toEqual(true);
            expect(check('false')).toEqual(true);
            expect(check('on')).toEqual(true);
            expect(check('off')).toEqual(true);
            expect(check([])).toEqual([{ type: 'boolean', actual: [], message }]);
            expect(check({})).toEqual([{ type: 'boolean', actual: {}, message }]);

            expect(check(false)).toEqual(true);
            expect(check(true)).toEqual(true);
        });

        it('should sanitize', () => {
            const check = v.compile({ status: { type: 'boolean', convert: true } });

            let obj: ValidationSchema = { status: 0 };
            expect(check(obj)).toEqual(true);
            expect(obj).toEqual({ status: false });

            obj = { status: 1 };
            expect(check(obj)).toEqual(true);
            expect(obj).toEqual({ status: true });

            obj = { status: 'true' };
            expect(check(obj)).toEqual(true);
            expect(obj).toEqual({ status: true });

            obj = { status: 'false' };
            expect(check(obj)).toEqual(true);
            expect(obj).toEqual({ status: false });

            obj = { status: 'off' };
            expect(check(obj)).toEqual(true);
            expect(obj).toEqual({ status: false });

            obj = { status: 'on' };
            expect(check(obj)).toEqual(true);
            expect(obj).toEqual({ status: true });
        });

    });
});
