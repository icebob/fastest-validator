let Validator = require("../index");

let v = new Validator();

const schema = {
	//id: { type: "number", positive: true, integer: true, convert: true },
	//name: { type: "string", min: 3, max: 255 },
	//password: { type: "forbidden" },
	//roles: { type: "array", items: "string", min: 1 },
	friends: { type: "array", items: { type: "object", properties: {
		name: "string",
		username: "string"
	}}},
	/*address: { type: "object", properties: {
		country: "string",
		city: "string",
		zip: "number"
	} },*/
	//email: { type: "email", mode: "precise" },
	//status: "boolean" // short-hand def
	//status: { type: "boolean", convert: true }
	status: [
		{ type: "boolean" },
		{ type: "number" }
	]
};

const check = v.compile(schema);

console.log("============");
console.log("John", check({
	id: 5,
	name: "John",
	email: "john.doe@moleculer.services",
	address: {
		country: "Hungary",
		city: "Budapest",
		zip: "1112"
	},
	roles: ["admin", "user", 3, 2, true],
	friends: [
		{ name: "John", username: "johnny" },
		{ name: "Jane", _username: "jane" }
	],
	status: 1,
}));

//console.log("Al", check({ id: "1", name: "Al", status: false, email: "a@b.cc" }));

