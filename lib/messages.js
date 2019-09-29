"use strict";

module.exports = {
	required: "The '{field}' field is required!",

	string: "The '{field}' field must be a string!",
	stringEmpty: "The '{field}' field must not be empty!",
	stringMin: "The '{field}' field length must be greater than or equal to {expected} characters long!",
	stringMax: "The '{field}' field length must be less than or equal to {expected} characters long!",
	stringLength: "The '{field}' field length must be {expected} characters long!",
	stringPattern: "The '{field}' field fails to match the required pattern!",
	stringContains: "The '{field}' field must contain the '{expected}' text!",
	stringEnum: "The '{field}' field does not match any of the allowed values!",
	stringNumeric: "The '{field}' field must be a numeric string",
	stringAlpha: "The '{field}' field must be an alphabetic string",
	stringAlphanum: "The '{field}' field must be an alphanumeric string",
	stringAlphadash: "The '{field}' field must be an alphadash string",

	number: "The '{field}' field must be a number!",
	numberMin: "The '{field}' field must be greater than or equal to {expected}!",
	numberMax: "The '{field}' field must be less than or equal to {expected}!",
	numberEqual: "The '{field}' field must be equal with {expected}!",
	numberNotEqual: "The '{field}' field can't be equal with {expected}!",
	numberInteger: "The '{field}' field must be an integer!",
	numberPositive: "The '{field}' field must be a positive number!",
	numberNegative: "The '{field}' field must be a negative number!",

	array: "The '{field}' field must be an array!",
	arrayEmpty: "The '{field}' field must not be an empty array!",
	arrayMin: "The '{field}' field must contain at least {expected} items!",
	arrayMax: "The '{field}' field must contain less than or equal to {expected} items!",
	arrayLength: "The '{field}' field must contain {expected} items!",
	arrayContains: "The '{field}' field must contain the '{expected}' item!",
	arrayEnum: "The '{field} field value '{expected}' does not match any of the allowed values!",

	boolean: "The '{field}' field must be a boolean!",

	function: "The '{field}' field must be a function!",

	date: "The '{field}' field must be a Date!",
	dateMin: "The '{field}' field must be greater than or equal to {expected}!",
	dateMax: "The '{field}' field must be less than or equal to {expected}!",

	forbidden: "The '{field}' field is forbidden!",

	email: "The '{field}' field must be a valid e-mail!",

	url: "The '{field}' field must be a valid URL!",

	enumValue: "The '{field} field value '{expected}' does not match any of the allowed values!",

	object: "The '{field}' must be an Object!",
	objectStrict: "The object '{field}' contains invalid keys: '{actual}'!",
	uuid: "The {field} field must be a valid UUID",
	uuidVersion: "The {field} field must be a valid version provided",
	mac: "The {field} field must be a valid MAC address",
	luhn: "The {field} field must be a valid checksum luhn",
};
