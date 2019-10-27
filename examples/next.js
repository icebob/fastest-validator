let Validator = require("../index");

let v = new Validator();

const schema = {
	//id: { type: "number", positive: true, integer: true, convert: true },
	name: { type: "string", min: 3, max: 255 },
	password: { type: "forbidden" },
	roles: { type: "array", items: "string", length: 2, enum: ["admin", "user"] },
	address: { type: "object", props: {
		country: "string",
		city: "string"
	} },
	//email: { type: "email", mode: "precise" },
	//status: "boolean" // short-hand def
	//status: { type: "boolean", convert: true }
};

const check = v.compile(schema);

console.log("============");
console.log("John", check({
	id: 5,
	name: "John",
	email: "john.doe@moleculer.services",
	address: {
		country: "Hungary",
		zip: 1112
	},
	roles: ["admin", "user"],
	status: true,
}));

//console.log("Al", check({ id: "1", name: "Al", status: false, email: "a@b.cc" }));

