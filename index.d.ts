/** type declaration for fastest-validator */

declare interface ValidationRuleObject {
    type: string;
    optional?: boolean;
    min?: number;
    max?: number;
    length?: number;
    pattern?: RegExp;
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
    check?: (value: any, ValidationSchema) => boolean | ValidationResult;
}

declare type ValidationRule = ValidationRuleObject | ValidationRuleObject[] | string;

declare interface ValidationSchema {
    [key: string]: ValidationRule;
}


declare interface ValidationError {
    type: string;
    field: string;
    message: string;
    expected?: any;
    actual?: any;
}

declare type ValidationResult = ValidationError[];
declare type ValidationObject = { [key: string]: any };

declare class Validator {
    constructor(opts?: any);

    add(type: string, fn: any): void;

    makeError(type: string, expected: any, actual: any): ValidationResult;

    compile(schema: ValidationSchema): (object: ValidationObject) => boolean | ValidationResult;

    validate(obj: ValidationObject, schema: ValidationSchema): boolean | ValidationResult;
}

declare module "fastest-validator" {
    export = Validator;
}
