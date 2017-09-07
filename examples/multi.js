let Validator = require("../index");

let v = new Validator();

const schema = {
	multi: [
		{ type: "string", min: 3, max: 255 },
		{ type: "boolean" }
	]
};

console.log(v.validate({ multi: "John" }, schema));
// Returns: true

console.log(v.validate({ multi: true }, schema));
// Returns: true

console.log(v.validate({ multi: false }, schema));
// Returns: true

console.log(v.validate({ multi: "Al" }, schema));
/* Returns an array with errors:

*/

console.log(v.validate({ multi: 100 }, schema));
/* Returns an array with errors:

*/
