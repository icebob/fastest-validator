
export type ValidationRuleName =
	| "any"
	| "array"
	| "boolean"
	| "class"
	| "currency"
	| "custom"
	| "date"
	| "email"
	| "enum"
	| "equal"
	| "forbidden"
	| "function"
	| "luhn"
	| "mac"
	| "multi"
	| "number"
	| "object"
	| "record"
	| "string"
	| "url"
	| "uuid"
	| string;

/**
 * Validation schema definition for "any" built-in validator
 * @see https://github.com/icebob/fastest-validator#any
 */
export interface RuleAny extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "any";
}

/**
 * Validation schema definition for "array" built-in validator
 * @see https://github.com/icebob/fastest-validator#array
 */
export interface RuleArray<T = any> extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "array";
	/**
	 * If true, the validator accepts an empty array [].
	 * @default true
	 */
	empty?: boolean;
	/**
	 * Minimum count of elements
	 */
	min?: number;
	/**
	 * Maximum count of elements
	 */
	max?: number;
	/**
	 * Fixed count of elements
	 */
	length?: number;
	/**
	 * The array must contain this element too
	 */
	contains?: T | T[];
	/**
	 * Every element must be an element of the enum array
	 */
	enum?: T[];
	/**
	 * Validation rules that should be applied to each element of array
	 */
	items?: ValidationRule;
}

/**
 * Validation schema definition for "boolean" built-in validator
 * @see https://github.com/icebob/fastest-validator#boolean
 */
export interface RuleBoolean extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "boolean";
	/**
	 * if true and the type is not Boolean, try to convert. 1, "true", "1", "on" will be true. 0, "false", "0", "off" will be false.
	 * @default false
	 */
	convert?: boolean;
}

/**
 * Validation schema definition for "class" built-in validator
 * @see https://github.com/icebob/fastest-validator#class
 */
export interface RuleClass<T = any> extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "class";
	/**
	 * Checked Class
	 */
	instanceOf?: T;
}

/**
 * Validation schema definition for "currency" built-in validator
 * @see https://github.com/icebob/fastest-validator#currency
 */
export interface RuleCurrency extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "currency";
	/**
	 * The currency symbol expected in string (as prefix)
	 * @default null
	 */
	currencySymbol?: string;
	/**
	 * Toggle to make the currency symbol optional in string
	 * @default false
	 */
	symbolOptional?: boolean;
	/**
	 * Thousand place separator character
	 * @default ','
	 */
	thousandSeparator?: string;
	/**
	 * Decimal place character
	 * @default '.'
	 */
	decimalSeparator?: string;
	/**
	 * Custom regular expression to validate currency strings
	 */
	customRegex?: RegExp | string;
}

/**
 * Validation schema definition for "date" built-in validator
 * @see https://github.com/icebob/fastest-validator#date
 */
export interface RuleDate extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "date";
	/**
	 * if true and the type is not Date, try to convert with new Date()
	 * @default false
	 */
	convert?: boolean;
}

/**
 * Validation schema definition for "email" built-in validator
 * @see https://github.com/icebob/fastest-validator#email
 */
export interface RuleEmail extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "email";
	/**
	 * If true, the validator accepts an empty string ""
	 * @default true
	 */
	empty?: boolean;
	/**
	 * Checker method. Can be quick or precise
	 */
	mode?: "quick" | "precise";
	/**
	 * Minimum value length
	 */
	min?: number;
	/**
	 * Maximum value length
	 */
	max?: number;

	normalize?: boolean;
}

/**
 * Validation schema definition for "enum" built-in validator
 * @see https://github.com/icebob/fastest-validator#enum
 */
export interface RuleEnum<T = any> extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "enum";
	/**
	 * The valid values
	 */
	values: T[];
}

/**
 * Validation schema definition for "equal" built-in validator
 * @see https://github.com/icebob/fastest-validator#equal
 */
export interface RuleEqual<T = any> extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "equal";
	/**
	 * The valid value
	 */
	value?: T;

	/**
	 * Another field name
	 */
	field?: string;

	/**
	 * Strict value checking.
	 *
	 * @type {'boolean'}
	 * @memberof RuleEqual
	 */
	strict?: boolean;
}

/**
 * Validation schema definition for "forbidden" built-in validator
 * @see https://github.com/icebob/fastest-validator#forbidden
 */
export interface RuleForbidden extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "forbidden";

	/**
	 * Removes the forbidden value.
	 *
	 * @type {'boolean'}
	 * @memberof RuleForbidden
	 */
	remove?: boolean;
}

/**
 * Validation schema definition for "function" built-in validator
 * @see https://github.com/icebob/fastest-validator#function
 */
export interface RuleFunction extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "function";
}

/**
 * Validation schema definition for "luhn" built-in validator
 * @see https://github.com/icebob/fastest-validator#luhn
 */
export interface RuleLuhn extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "luhn";
}

/**
 * Validation schema definition for "mac" built-in validator
 * @see https://github.com/icebob/fastest-validator#mac
 */
export interface RuleMac extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "mac";
}

/**
 * Validation schema definition for "multi" built-in validator
 * @see https://github.com/icebob/fastest-validator#multi
 */
export interface RuleMulti extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "multi";

	rules: RuleCustom[] | string[];
}

/**
 * Validation schema definition for "number" built-in validator
 * @see https://github.com/icebob/fastest-validator#number
 */
export interface RuleNumber extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "number";
	/**
	 * Minimum value
	 */
	min?: number;
	/**
	 * Maximum value
	 */
	max?: number;
	/**
	 * Fixed value
	 */
	equal?: number;
	/**
	 * Can't be equal to this value
	 */
	notEqual?: number;
	/**
	 * The value must be a non-decimal value
	 * @default false
	 */
	integer?: boolean;
	/**
	 * The value must be greater than zero
	 * @default false
	 */
	positive?: boolean;
	/**
	 * The value must be less than zero
	 * @default false
	 */
	negative?: boolean;
	/**
	 * if true and the type is not Number, converts with Number()
	 * @default false
	 */
	convert?: boolean;
}

/**
 * Validation schema definition for "object" built-in validator
 * @see https://github.com/icebob/fastest-validator#object
 */
export interface RuleObject extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "object";
	/**
	 * If `true` any properties which are not defined on the schema will throw an error.<br>
	 * If `remove` all additional properties will be removed from the original object. It's a sanitizer, it will change the original object.
	 * @default false
	 */
	strict?: boolean | "remove";
	/**
	 * List of properties that should be validated by this rule
	 */
	properties?: ValidationSchema;
	props?: ValidationSchema;
	/**
	 * If set to a number, will throw if the number of props is less than that number.
	 */
	minProps?: number;
	/**
	 * If set to a number, will throw if the number of props is greater than that number.
	 */
	maxProps?: number;
}

export interface RuleObjectID extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "objectID";
	/**
	 * To inject ObjectID dependency
	 */
	ObjectID?: any;
	/**
	 * Convert HexStringObjectID to ObjectID
	 */
	convert?: boolean | "hexString";
}

export interface RuleRecord extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "record";
	/**
	 * Key validation rule
	 */
	key?: RuleString;
	/**
	 * Value validation rule
	 */
	value?: ValidationRuleObject;
}

/**
 * Validation schema definition for "string" built-in validator
 * @see https://github.com/icebob/fastest-validator#string
 */
export interface RuleString extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "string";
	/**
	 * If true, the validator accepts an empty string ""
	 * @default true
	 */
	empty?: boolean;
	/**
	 * Minimum value length
	 */
	min?: number;
	/**
	 * Maximum value length
	 */
	max?: number;
	/**
	 * Fixed value length
	 */
	length?: number;
	/**
	 * Regex pattern
	 */
	pattern?: string | RegExp;
	/**
	 * The value must contain this text
	 */
	contains?: string;
	/**
	 * The value must be an element of the enum array
	 */
	enum?: string[];
	/**
	 * The value must be a numeric string
	 */
	numeric?: boolean;
	/**
	 * The value must be an alphabetic string
	 */
	alpha?: boolean;
	/**
	 * The value must be an alphanumeric string
	 */
	alphanum?: boolean;
	/**
	 * The value must be an alphabetic string that contains dashes
	 */
	alphadash?: boolean;
	/**
	 * The value must be a hex string
	 * @default false
	 */
	hex?: boolean;
	/**
	 * The value must be a singleLine string
	 * @default false
	 */
	singleLine?: boolean;
	/**
	 * The value must be a base64 string
	 * @default false
	 */
	base64?: boolean;
	/**
	 * if true and the type is not a String, converts with String()
	 * @default false
	 */
	convert?: boolean;

	trim?: boolean;
	trimLeft?: boolean;
	trimRight?: boolean;

	padStart?: number;
	padEnd?: number;
	padChar?: string;

	lowercase?: boolean;
	uppercase?: boolean;
	localeLowercase?: boolean;
	localeUppercase?: boolean;
}

/**
 * Validation schema definition for "tuple" built-in validator
 * @see https://github.com/icebob/fastest-validator#array
 */
export interface RuleTuple<T = any> extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "tuple";
	/**
	 * Validation rules that should be applied to the corresponding element of array
	 */
	items?: [ValidationRule, ValidationRule];
}

/**
 * Validation schema definition for "url" built-in validator
 * @see https://github.com/icebob/fastest-validator#url
 */
export interface RuleURL extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "url";
	/**
	 * If true, the validator accepts an empty string ""
	 * @default true
	 */
	empty?: boolean;
}

/**
 * Validation schema definition for "uuid" built-in validator
 * @see https://github.com/icebob/fastest-validator#uuid
 */
export interface RuleUUID extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "uuid";
	/**
	 * UUID version in range 0-6
	 */
	version?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Validation schema definition for custom inline validator
 * @see https://github.com/icebob/fastest-validator#custom-validator
 */
export interface RuleCustomInline<T = any> extends RuleCustom {
	/**
	 * Name of built-in validator
	 */
	type: "custom";
	/**
	 * Custom checker function
	 */
	check: CheckerFunction<T>;
}

/**
 * Validation schema definition for custom validator
 * @see https://github.com/icebob/fastest-validator#custom-validator
 */
export interface RuleCustom {
	/**
	 * Name of custom validator that will be used in validation rules
	 */
	type: string;
	/**
	 * Every field in the schema will be required by default. If you'd like to define optional fields, set optional: true.
	 * @default false
	 */
	optional?: boolean;

	/**
	 * If you want disallow `undefined` value but allow `null` value, use `nullable` instead of `optional`.
	 * @default false
	 */
	nullable?: boolean;

	/**
	 * You can set your custom messages in the validator constructor
	 * Sometimes the standard messages are too generic. You can customise messages per validation type per field
	 */
	messages?: MessagesType;

	/**
	 * Default value
	 */
	default?: any;

	/**
	 * Custom checker function
	 */
	custom?: CheckerFunction;

	/**
	 * You can define any additional options for custom validators
	 */
	[key: string]: any;
}

/**
 * List of all possible keys that can be used for error message override
 */
export interface BuiltInMessages {
	/**
	 * The '{field}' field is required.
	 */
	required?: string;
	/**
	 * The '{field}' field must be a string.
	 */
	string?: string;
	/**
	 * The '{field}' field must not be empty.
	 */
	stringEmpty?: string;
	/**
	 * The '{field}' field length must be greater than or equal to {expected} characters long.
	 */
	stringMin?: string;
	/**
	 * The '{field}' field length must be less than or equal to {expected} characters long.
	 */
	stringMax?: string;
	/**
	 * The '{field}' field length must be {expected} characters long.
	 */
	stringLength?: string;
	/**
	 * The '{field}' field fails to match the required pattern.
	 */
	stringPattern?: string;
	/**
	 * The '{field}' field must contain the '{expected}' text.
	 */
	stringContains?: string;
	/**
	 * The '{field}' field does not match any of the allowed values.
	 */
	stringEnum?: string;
	/**
	 * The '{field}' field must be a numeric string.
	 */
	stringNumeric?: string;
	/**
	 * The '{field}' field must be an alphabetic string.
	 */
	stringAlpha?: string;
	/**
	 * The '{field}' field must be an alphanumeric string.
	 */
	stringAlphanum?: string;
	/**
	 * The '{field}' field must be an alphadash string.
	 */
	stringAlphadash?: string;

	/**
	 * The '{field}' field must be a number.
	 */
	number?: string;
	/**
	 * The '{field}' field must be greater than or equal to {expected}.
	 */
	numberMin?: string;
	/**
	 * The '{field}' field must be less than or equal to {expected}.
	 */
	numberMax?: string;
	/**
	 * The '{field}' field must be equal with {expected}.
	 */
	numberEqual?: string;
	/**
	 * The '{field}' field can't be equal with {expected}.
	 */
	numberNotEqual?: string;
	/**
	 * The '{field}' field must be an integer.
	 */
	numberInteger?: string;
	/**
	 * The '{field}' field must be a positive number.
	 */
	numberPositive?: string;
	/**
	 * The '{field}' field must be a negative number.
	 */
	numberNegative?: string;

	/**
	 * The '{field}' field must be an array.
	 */
	array?: string;
	/**
	 * The '{field}' field must not be an empty array.
	 */
	arrayEmpty?: string;
	/**
	 * The '{field}' field must contain at least {expected} items.
	 */
	arrayMin?: string;
	/**
	 * The '{field}' field must contain less than or equal to {expected} items.
	 */
	arrayMax?: string;
	/**
	 * The '{field}' field must contain {expected} items.
	 */
	arrayLength?: string;
	/**
	 * The '{field}' field must contain the '{expected}' item.
	 */
	arrayContains?: string;
	/**
	 * The '{field} field value '{expected}' does not match any of the allowed values.
	 */
	arrayEnum?: string;

	/**
	 * The '{field}' field must be a boolean.
	 */
	boolean?: string;

	/**
	 * The '{field}' field must be a Date.
	 */
	date?: string;
	/**
	 * The '{field}' field must be greater than or equal to {expected}.
	 */
	dateMin?: string;
	/**
	 * The '{field}' field must be less than or equal to {expected}.
	 */
	dateMax?: string;

	/**
	 * The '{field}' field value '{expected}' does not match any of the allowed values.
	 */
	enumValue?: string;

	/**
	 * The '{field}' field value must be equal to '{expected}'.
	 */
	equalValue?: string;
	/**
	 * The '{field}' field value must be equal to '{expected}' field value.
	 */
	equalField?: string;

	/**
	 * The '{field}' field is forbidden.
	 */
	forbidden?: string;

	/**
	 * The '{field}' field must be a function.
	 */
	function?: string;

	/**
	 * The '{field}' field must be a valid e-mail.
	 */
	email?: string;

	/**
	 * The '{field}' field must be a valid checksum luhn.
	 */
	luhn?: string;

	/**
	 * The '{field}' field must be a valid MAC address.
	 */
	mac?: string;

	/**
	 * The '{field}' must be an Object.
	 */
	object?: string;
	/**
	 * The object '{field}' contains forbidden keys: '{actual}'.
	 */
	objectStrict?: string;

	/**
	 * The '{field}' field must be a valid URL.
	 */
	url?: string;

	/**
	 * The '{field}' field must be a valid UUID.
	 */
	uuid?: string;
	/**
	 * The '{field}' field must be a valid UUID version provided.
	 */
	uuidVersion?: string;
}

/**
 * Type with description of custom error messages
 */
export type MessagesType = BuiltInMessages & { [key: string]: string };

/**
 * Union type of all possible built-in validators
 */
export type ValidationRuleObject =
	| RuleAny
	| RuleArray
	| RuleBoolean
	| RuleClass
	| RuleCurrency
	| RuleDate
	| RuleEmail
	| RuleEqual
	| RuleEnum
	| RuleForbidden
	| RuleFunction
	| RuleLuhn
	| RuleMac
	| RuleMulti
	| RuleNumber
	| RuleObject
	| RuleObjectID
	| RuleRecord
	| RuleString
	| RuleTuple
	| RuleURL
	| RuleUUID
	| RuleCustom
	| RuleCustomInline;

/**
 * Description of validation rule definition for a some property
 */
export type ValidationRule =
	| ValidationRuleObject
	| ValidationRuleObject[]
	| ValidationRuleName;

/**
 * Definition for validation schema based on validation rules
 */
export type ValidationSchema<T = any> = {
	/**
	 * Object properties which are not specified on the schema are ignored by default.
	 * If you set the $$strict option to true any additional properties will result in an strictObject error.
	 * @default false
	 */
	$$strict?: boolean | "remove";

	/**
	 * Enable asynchronous functionality. In this case the `validate` and `compile` methods return a `Promise`.
	 * @default false
	 */
	$$async?: boolean;

	/**
	 * Basically the validator expects that you want to validate a Javascript object.
	 * If you want others, you can define the root level schema.
	 * @default false
	 */
	$$root?: boolean;
} & {
		/**
		 * List of validation rules for each defined field
		 */
		[key in keyof T]: ValidationRule | undefined | any;
	};

/**
 * Structure with description of validation error message
 */
export interface ValidationError {
	/**
	 * Name of validation rule that generates this message
	 */
	type: keyof BuiltInMessages | string;
	/**
	 * Field that catch validation error
	 */
	field: string;
	/**
	 * Description of current validation error
	 */
	message?: string;
	/**
	 * Expected value from validation rule
	 */
	expected?: any;
	/**
	 * Actual value received by validation rule
	 */
	actual?: any;
}

/**
 * List of possible validator constructor options
 */
export interface ValidatorConstructorOptions {
	debug?: boolean;
	/**
	 * List of possible error messages
	 */
	messages?: MessagesType;

	/**
	 * using checker function v2?
	 */
	useNewCustomCheckerFunction?: boolean;

	/**
	 * consider null as a value?
	 */
	considerNullAsAValue?: boolean;

	/**
	 * Immediately halt after the first error
	 */
	haltOnFirstError?: boolean

	/**
	 * Default settings for rules
	 */
	defaults?: {
		[key in ValidationRuleName]: ValidationSchema;
	};

	/**
	 * For set aliases
	 */
	aliases?: {
		[key: string]: ValidationRuleObject;
	};

	/**
	 * For set custom rules.
	 */
	customRules?: {
		[key: string]: CompilationFunction;
	};

	/**
	 * For set plugins.
	 */
	plugins?: PluginFn<any>[];
}

export interface CompilationRule {
	index: number;
	ruleFunction: CompilationFunction;
	schema: ValidationSchema;
	messages: MessagesType;
}

export interface Context<DATA = any> {
	index: number;
	async: boolean;
	rules: ValidationRuleObject[];
	fn: Function[];
	customs: {
		[ruleName: string]: { schema: RuleCustom; messages: MessagesType };
	};
	meta?: object;
	data: DATA;
}

export interface CheckerFunctionError {
	type: string;
	expected?: unknown;
	actual?: unknown;
	field?: string;
}

export type CheckerFunctionV1<T = unknown> = (
	value: T,
	ruleSchema: ValidationRuleObject,
	path: string,
	parent: object | null,
	context: Context
) => true | ValidationError[];
export type CheckerFunctionV2<T = unknown> = (
	value: T,
	errors: CheckerFunctionError[],
	ruleSchema: ValidationRuleObject,
	path: string,
	parent: object | null,
	context: Context
) => T;

export type CheckerFunction<T = unknown> =
	| CheckerFunctionV1<T>
	| CheckerFunctionV2<T>;

export type CompilationFunction = (
	rule: CompilationRule,
	path: string,
	context: Context
) => { sanitized?: boolean; source: string };

export type PluginFn<T = void> = (validator: Validator) => T;

export interface CheckFunctionOptions {
	meta?: object | null;
}

export interface SyncCheckFunction {
	(value: any, opts?: CheckFunctionOptions): true | ValidationError[]
	async: false
}

export interface AsyncCheckFunction {
	(value: any, opts?: CheckFunctionOptions): Promise<true | ValidationError[]>
	async: true
}

export default class Validator {
	/**
	 * List of possible error messages
	 */
	messages: MessagesType;

	/**
	 * List of rules attached to current validator
	 */
	rules: { [key: string]: ValidationRuleObject };

	/**
	 * List of aliases attached to current validator
	 */
	aliases: { [key: string]: ValidationRule };

	/**
	 * Constructor of validation class
	 * @param {ValidatorConstructorOptions} opts List of possible validator constructor options
	 */
	constructor(opts?: ValidatorConstructorOptions);

	/**
	 * Register a custom validation rule in validation object
	 * @param {string} type
	 * @param fn
	 */
	add(type: string, fn: CompilationFunction): void;

	/**
	 * Add a message
	 *
	 * @param {String} name
	 * @param {String} message
	 */
	addMessage(name: string, message: string): void;

	/**
	 * Register an alias in validation object
	 * @param {string} name
	 * @param {ValidationRuleObject} validationRule
	 */
	alias(name: string, validationRule: ValidationRuleObject): void;

	/**
	 * Add a plugin
	 *
	 * @param {Function} fn
	 */
	plugin<T = void>(fn: PluginFn<T>): T;

	/**
	 * Build error message
	 * @return {ValidationError}
	 * @param {Object} opts
	 * @param {String} opts.type
	 * @param {String} opts.field
	 * @param {any=} opts.expected
	 * @param {any=} opts.actual
	 * @param {MessagesType} opts.messages
	 */
	makeError(opts: {
		type: keyof MessagesType;
		field?: string;
		expected?: any;
		actual?: any;
		messages: MessagesType;
	}): string;

	/**
	 * Compile validator functions that working up 100 times faster that native validation process
	 * @param {ValidationSchema | ValidationSchema[]} schema Validation schema definition that should be used for validation
	 * @return {(value: any) => (true | ValidationError[])} function that can be used next for validation of current schema
	 */
	compile<T = any>(
		schema: ValidationSchema<T> | ValidationSchema<T>[]
	): SyncCheckFunction | AsyncCheckFunction;

	/**
	 * Native validation method to validate obj
	 * @param {any} value that should be validated
	 * @param {ValidationSchema} schema Validation schema definition that should be used for validation
	 * @return {{true} | ValidationError[]}
	 */
	validate(
		value: any,
		schema: ValidationSchema
	): true | ValidationError[] | Promise<true | ValidationError[]>;

	/**
	 * Get defined in validator rule
	 * @param {ValidationRuleName | ValidationRuleName[]} name List or name of defined rule
	 * @return {ValidationRule}
	 */
	getRuleFromSchema(
		name: ValidationRuleName | ValidationRuleName[] | { [key: string]: unknown }
	): {
		messages: MessagesType;
		schema: ValidationSchema;
		ruleFunction: Function;
	};

	/**
	 * Normalize a schema, type or short hand definition by expanding it to a full form. The 'normalized'
	 * form is the equivalent schema with any short hands undone. This ensure that each rule; always includes
	 * a 'type' key, arrays always have an 'items' key, 'multi' always have a 'rules' key and objects always
	 * have their properties defined in a 'props' key
	 *
	 * @param { ValidationSchema | string | any } value The value to normalize
	 * @return {ValidationRule | ValidationSchema } The normalized form of the given rule or schema
	 */
	normalize(
		value: ValidationSchema | string | any
	): ValidationRule | ValidationSchema
}
