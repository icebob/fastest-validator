const Validator = require("fastest-validator");

const v = new Validator();

const schema = {
	multi: [
		{ type: "string" },
		{ type: "boolean" }
	]
};

window.alert("Validate 'John' as string: " + v.validate({ multi: "John" }, schema));
// Returns: true

window.alert("Validate 'false' as boolean: " + v.validate({ multi: false }, schema));
// Returns: true

window.alert("Validate '123' as number: " + JSON.stringify(v.validate({ multi: 123 }, schema)));
// Returns: an array with errors
