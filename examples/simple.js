let Validator = require("../index");

let v = new Validator({ debug: true });

const schema = {
	name: {
		type: "string",
		min: 4,
		max: 25
	},
	email: { type: "email" },
	firstName: { type: "string" },
	phone: { type: "string"},
	age: {
		type: "number",
		min: 18
	}
};

const check = v.compile(schema);

console.log(check({
	name: "John Doe",
	email: "john.doe@company.space",
	firstName: "John",
	phone: "123-4567",
	age: 33
}));
