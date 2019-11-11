/// <reference path="../../index.d.ts" /> // here we make a reference to exists module definition
import ValidatorType from 'fastest-validator'; // here we importing type definition of default export

const Validator: typeof ValidatorType = require('../../index'); // here we importing real Validator Constructor

describe('Typescript Definitions', () => {
    it('should compile validator', async () => {
        const v = new Validator();
        const compiled = v.compile({
			id: { type: "number", min: 1, integer: true }
		});

        expect(compiled).toBeInstanceOf(Function)

		const res = compiled({
			id: 2
		});

		expect(res).toBe(true);
    });
});

