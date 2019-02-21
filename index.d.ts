/** type declaration for fastest-validator */

interface ValidationRuleObject {
    type: string;
    optional?: boolean;
	empty?: boolean;
    min?: number;
    max?: number;
    length?: number;
    pattern?: RegExp | string;
    contains?: string;
    enum?: any;
    values?: any[];
    alpha?: boolean;
    numeric?: boolean;
    alphanum?: boolean;
    alphadash?: boolean;
    equal?: any;
    notEqual?: any;
    positive?: boolean;
    negative?: boolean;
    integer?: boolean;
    convert?: boolean;
    items?: string;
    props?: ValidationSchema;
    check?: (value: any, schema: ValidationSchema) => true | ValidationResult;
}

type ValidationRule = ValidationRuleObject | ValidationRuleObject[] | string;

interface ValidationSchema {
    [key: string]: ValidationRule;
}


interface ValidationError {
    type: string;
    field: string;
    message: string;
    expected?: any;
    actual?: any;
}

type ValidationResult = ValidationError[];
type ValidationObject = { [key: string]: any };

class Validator {
    constructor(opts?: any);

    add(type: string, fn: any): void;

    makeError(type: string, expected: any, actual: any): ValidationResult;

    compile(schema: ValidationSchema | ValidationSchema[]): (object: ValidationObject) => boolean | ValidationResult;

    validate(obj: ValidationObject, schema: ValidationSchema): boolean | ValidationResult;
}

export {
	ValidationRuleObject,
	ValidationRule,
	ValidationSchema,
	ValidationError,
	ValidationResult,
	ValidationObject,
}

export = Validator
