let Validator = require("../index");

let v = new Validator();

const schema = {
	multi: [
		{ type: "string", min: 3, max: 255 },
		{ type: "boolean" }
	]
};

const check = v.compile(schema);

console.log(check({ multi: "John" }));
// Returns: true

console.log(check({ multi: true }));
// Returns: true

console.log(check({ multi: false }));
// Returns: true

console.log(check({ multi: "Al" }));
/* Returns an array with errors:

*/

console.log(check({ multi: 100 }));
/* Returns an array with errors:

*/
