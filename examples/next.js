let Validator = require("../index");

let v = new Validator();

const schema = {
	//id: { type: "number", positive: true, integer: true, convert: true },
	//name: { type: "string", min: 3, max: 255 },
	email: { type: "email", mode: "precise" },
	status: "boolean" // short-hand def
	//status: { type: "boolean", convert: true }
};

const check = v.compileSchemaObject2(schema);

console.log("============");
console.log("John", check({ id: 5, name: "John", status: true, email: "john.doe@moleculer.services" }));
console.log("Al", check({ id: "1", name: "Al", status: false, email: "a@b.cc" }));

