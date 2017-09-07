let Validator = require("../index");

let v = new Validator();

const schema = {
	id: { type: "number", positive: true, integer: true },
	name: { type: "string", min: 3, max: 255 },
	status: "boolean" // short-hand def
};

const check = v.compile(schema);

console.log(check({ id: 5, name: "John", status: true }));
// Returns: true

console.log(check({ id: 2, name: "Adam" }));
/* Returns an array with errors:
	[
		{ 
			type: 'required',
			args: [],
			field: 'status',
			message: 'The \'status\' field is required!'
		}
	]
*/
