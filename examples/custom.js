let Validator = require("../index");

let v = new Validator({
	messages: {
		// Register our new error message text
		evenNumber: "The '{field}' field must be an even number! Actual: {actual}",
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
	age: { type: "even" },
	weight: {
		type: "custom",
		minWeight: 10,
		messages: {
			// Register our new error message text
			weightMin: "The weight must be greater than {expected}! Actual: {actual}"
		},
		check(value, schema) {
			return (value < schema.minWeight)
				? this.makeError("weightMin", schema.minWeight, value)
				: true;
		}
	}
};

//console.log(v.validate({ name: "John", age: 20 }, schema));
// Returns: true

//console.log(v.validate({ name: "John", age: 19 }, schema));
/* Returns an array with errors:
	[{
		type: 'evenNumber',
		expected: null,
		actual: 19,
		field: 'age',
		message: 'The \'age\' field must be an even number! Actual: 19'
	}]
*/

console.log(v.validate({ name: "John", age: 20, weight: 50 }, schema));
// Returns: true

console.log(v.validate({ name: "John", age: 20, weight: 8 }, schema));
/* Returns an array with errors:
	[{
		type: 'weightMin',
		expected: 10,
		actual: 8,
		field: 'weight',
		message: 'The weight must be greater than 10! Actual: 8'
	}]
*/
