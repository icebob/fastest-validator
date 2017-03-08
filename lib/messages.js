"use strict";

module.exports = {
	required: "The '{name}' field is required!",

	string: "The '{name}' field must be a string!",
	stringEmpty: "The '{name}' field must not be empty!",
	stringMin: "The '{name}' field length must be larger than or equal to {0} characters long!",
	stringMax: "The '{name}' field length must be less than or equal to {0} characters long!",
	stringLength: "The '{name}' field length must be {0} characters long!",
	stringPattern: "The '{name}' field fails to match the required pattern!",
	stringContains: "The '{name}' field must contain the '{0}' text!",
	stringEnum: "The '{name}' field does not match any of the allowed values!",

	number: "The '{name}' field must be a number!",
	numberMin: "The '{name}' field must be larger than or equal to {0}!",
	numberMax: "The '{name}' field must be less than or equal to {0}!",
	numberEqual: "The '{name}' field must be equal with {0}!",
	numberNotEqual: "The '{name}' field can't be equal with {0}!",
	numberInteger: "The '{name}' field must be an integer!",
	numberPositive: "The '{name}' field must be a positive number!",
	numberNegative: "The '{name}' field must be a negative number!",
	
	array: "The '{name}' field must be an array!",
	arrayEmpty: "The '{name}' field must not be an empty array!",
	arrayMin: "The '{name}' field must contain at least {0} items!",
	arrayMax: "The '{name}' field must contain less than or equal to {0} items!",
	arrayLength: "The '{name}' field must contain {0} items!",
	arrayContains: "The '{name}' field must contain the '{0}' item!",
	arrayEnum: "The '{name} field value '{0}' does not match any of the allowed values!",

	boolean: "The '{name}' field must be a boolean!",

	function: "The '{name}' field must be a function!",

	date: "The '{name}' field must be a Date!",
	dateMin: "The '{name}' field must be larger than or equal to {0}!",
	dateMax: "The '{name}' field must be less than or equal to {0}",

	forbidden: "The '{name}' field is forbidden!",
	
	email: "The '{name}' field must be a valid e-mail!"
};