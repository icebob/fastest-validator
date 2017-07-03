/* eslint-disable no-console */

let Validator = require("../index");

let v = new Validator({
	messages: {
		// Register our new error message text
		evenNumber: "The '{field}' field must be an even number! Actual: {actual}"
	}
});

// Register a custom 'even' validator
v.add("even", value => {
	if (value % 2 != 0)
		return v.makeError("evenNumber", null, value);

	return true;
});

const schema = {
	name: { type: "string", min: 3, max: 255 },
	age: { type: "even" }
};

console.log(v.validate({ name: "John", age: 20 }, schema));
// Returns: true

console.log(v.validate({ name: "John", age: 19 }, schema));
/* Returns an array with errors:
	[{
		type: 'evenNumber',
		expected: null,
		actual: 19,
		field: 'age',
		message: 'The \'age\' field must be an even number! Actual: 19'
	}]
*/
