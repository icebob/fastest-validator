let Validator = require("../index");

let v = new Validator({
	debug: true,
	messages: {
		stringMin: "A(z) '{field}' mező túl rövid. Minimum: {expected}, Jelenleg: {actual}"
	}
});

const schema = {
	//id: { type: "number", positive: true, integer: true, convert: true },
	name: { type: "string", min: 3, max: 255, padStart: 5 },
	//token: { type: "forbidden" },
	//password: { type: "string", min: 6 },
	//confirmPassword: { type: "equal", field: "password" },
	//roles: { type: "array", items: "string", min: 1 },
	/*friends: { type: "array", items: { type: "object", properties: {
		name: "string",
		username: "string"
	}}},*/
	/*address: { type: "object", properties: {
		country: "string",
		city: "string",
		zip: "number"
	} },*/
	//age: { type: "number", min: 18 },
	email: { type: "email", mode: "precise", normalize: true },
	//verified: { type: "equal", value: true, strict: true },
	//status: "boolean" // short-hand def
	//createdAt: { type: "date", convert: true },
	//status: { type: "boolean", convert: true },
	//code: { type: "string", padEnd: 10, padChar: "\u2605" },
	status: [
		{ type: "boolean" },
		{ type: "number" }
	],

	/*weight: {
		type: "custom",
		minWeight: 10,
		check(value, schema, field) {
			return (value < schema.minWeight)
				? [{ type: "weightMin", field, expected: schema.minWeight, actual: value }]
				: true;
		},
		messages: {
			weightMin: "The '${field}' must be greater than {expected}! Actual: {actual}"
		}
	}*/
};

const check = v.compile(schema);

console.log("============");
const obj = {
	id: "5",
	name: "John",
	email: "   John.DOE@moleculer.Services   ",
	age: 5,
	address: {
		country: "Hungary",
		city: "Budapest",
		zip: "1112"
	},
	roles: ["admin", "user", 3, 2, true],
	friends: [
		{ name: "John", username: "johnny" },
		{ name: "Jane", username: "jane" }
	],
	password: "123456",
	confirmPassword: "123456",
	code: "123",
	status: 1,
	verified: true,

	createdAt: Date.now(),

	weight: 10,
};
console.log(check(obj), obj);

//console.log("Al", check({ id: "1", name: "Al", status: false, email: "a@b.cc" }));

