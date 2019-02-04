let Validator = require("../index");

let v = new Validator();

const schema = {
	id: { type: "number", positive: true, integer: true },
	name: { type: "string", min: 3, max: 255 },
	status: "boolean" // short-hand def
};

console.log(v.validate({ id: 5, name: "John", status: true }, schema));
// Returns: true

console.log(v.validate({ id: 5, name: "Al", status: true }, schema));
/* Returns an array with errors:
	[
		{ 
			type: 'stringMin',
			args: [
				3,
				2
			],
			field: 'name',
			message: 'The \'name\' field length must be greater than or equal to 3 characters long!'
		}
	]
*/
