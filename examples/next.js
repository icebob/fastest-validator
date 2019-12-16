let Validator = require("../index");

let v = new Validator({
	debug: true,
	messages: {
		stringMin: "A(z) '{field}' mező túl rövid. Minimum: {expected}, Jelenleg: {actual}",
		evenNumber: "The '{field}' field must be an even number! Actual: {actual}"
	}
});

v.add("even", function({ schema, messages }, path, context) {
	return {
		source: `
			if (value % 2 != 0)
				${this.makeError({ type: "evenNumber",  actual: "value", messages })}

			return value;
		`
	};
});

const schema = {
	//id: "number|positive|integer|convert",
	//name: "string|min: 3|max: 255|padStart: 5",
	//token: "forbidden|remove",
	//password: { type: "string", min: 6 },
	//confirmPassword: { type: "equal", field: "password" },
	//roles: { type: "array", items: "string", min: 1, default: ["user"] },
	/*friends: { type: "array", items: { type: "object", properties: {
		name: "string",
		username: "string"
	}}},*/
	/*address: { type: "object", strict: "remove", properties: {
		country: "string",
		city: "string"
	} },*/
	//bio: { type: "string", convert: true },
	//age: { type: "number", min: 18 },
	//email: { type: "email", mode: "precise", normalize: true },
	//verified: { type: "equal", value: true, strict: true },
	//status: "boolean" // short-hand def
	//createdAt: { type: "date", convert: true },
	//status: { type: "boolean", convert: true },
	//code: { type: "string", padEnd: 10, padChar: "\u2605", default: "default-code" },
	/*status: [
		{ type: "boolean" },
		{ type: "number" }
	],*/

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
	includes: { type: "multi", optional: true, rules: [ { type: "string" }, { type: "array", items: "string" } ] },
	//num: { type: "even" }
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
	bio: null,
	//roles: ["admin", "user", 3, 2, true],
	friends: [
		{ name: "John", username: "johnny" },
		{ name: "Jane", username: "jane" }
	],
	password: "123456",
	confirmPassword: "123456",
	token: "abcdef",
	//code: "123",
	status: 1,
	verified: true,

	createdAt: Date.now(),

	//includes: "test1",
	//includes: ["test1", "test2"],

	weight: 10,
	num: 2
};
console.log(check(obj), obj);

//console.log("Al", check({ id: "1", name: "Al", status: false, email: "a@b.cc" }));

