"use strict";

const Validator = require("../index");
const v = new Validator({
	messages: {
		stringMin: "A '{name}' mező túl rövid. Minimum: {0}, Jelenleg: {1}"
	}
});
/*
v.add("url", (value, schema) => {
	const PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

	if (typeof value !== "string") {
		return { msg: "string" };
	}
	
	if (!PATTERN.test(value)) {
		return { msg: "url" }
	}

	return true;	
});*/

const schema = {
	id: { type: "number", min: 1, max: 100 },
	name: { type: "string", optional: false, min: 3, max: 128 },
	settings: { type: "object", props: {
		notify: { type: "boolean" }
		//notify: { type: ["boolean", "object" ] } // 2 accepted type: Boolean or Object
	}},
	sex: { type: "string", enum: ["male", "female"] },
	roles: { type: "array", enum: ["admin", "user"] },
	//comments: { type: "array", items: { type: "object" } },
	email: { type: "email", optional: true },
	homepage: { type: "url", optional: true },
	status: "boolean",
	age: { type: "number", min: 18, max: 100, convert: true },
	apikey: "forbidden",
	action: "function",
	created: "date"
};

const obj = {
	id: 5,
	name: "John",
	sex: "male",
	settings: {
		notify: true
	},
	roles: [
		"user"
	],
	email: "john.doe@clipboard.space",
	homepage: "http://google.com",
	status: true,
	age: "28",
	apikey: null,
	action: () => {},
	created: new Date()
};

const res = v.validate(obj, schema);

console.log(res);