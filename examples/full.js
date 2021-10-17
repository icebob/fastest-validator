"use strict";

const Validator = require("../index");
const v = new Validator({
	useNewCustomCheckerFunction: true,
	messages: {
		stringMin: "A(z) '{field}' mező túl rövid. Minimum: {expected}, Jelenleg: {actual}",
		phoneNumber: "The phone number must be started with '+'! Actual: {actual}"
	}
});

const schema = {
	id: { type: "number", min: 1, max: 100 },
	name: { type: "string", optional: false, min: 3, max: 128 },
	settings: { type: "object", props: {
		notify: [
			{ type: "boolean" },
			{ type: "object" }
		]
	}},
	sex: { type: "string", enum: ["male", "female"] },
	sex2: { type: "enum", values: ["male", "female"] },
	roles: { type: "array", items: { type: "string" }, enum: ["admin", "user"] },
	friends: { type: "array", items: { type: "number", positive: true }},
	comments: { type: "array", items: { type: "object", props: {
		user: { type: "number", positive: true, integer: true },
		content: { type: "string" },
		voters: { type: "array", optional: true, items: { type: "number" }}
	} } },
	multiarray: { type: "array", empty: false, items: {
		type: "array", empty: true, items: {
			type: "number"
		}
	}},
	email: { type: "email", optional: true },
	homepage: { type: "url", optional: true },
	status: "boolean",
	age: { type: "number", min: 18, max: 100, convert: true },
	apikey: "forbidden",
	uuidv4: { type: "uuid", version: 4 },
	uuid: "uuid",
	phone: { type: "string", length: 15, custom: (v, errors) => {
		if (!v.startsWith("+"))
			errors.push({ type: "phoneNumber", actual: v });
		return v.replace(/[^\d+]/g, "");
	} },
	action: "function",
	created: "date",
	raw: { type: "class", instanceOf: Buffer, custom: v => v.toString("base64") },
	now: { type: "date", convert: true },
	state: {
		type: "enum",
		values: ["active", "inactive"],
		defVal: "active",
		default: (schema, field, parent, context) => {
			return schema.defVal;
		}
	}
};

const obj = {
	id: 5,
	name: "John",
	sex: "male",
	sex2: "female",
	settings: {
		//notify: true,
		notify: {
			corner: "top"
		}
	},
	roles: [
		"user"
	],

	friends: [
		5,
		10,
		2
	],

	comments: [
		{ user: 1, content: "Cool!" },
		{ user: 2, content: "Very fast!" },
		{ user: 1, content: "", voters: [1] }
	],

	multiarray: [
		[
		],
		[
			5,
			10,
			//"a"
		]
	],

	email: "john.doe@clipboard.space",
	homepage: "http://google.com",
	status: true,
	age: "28",
	apikey: null,
	uuidv4: "10ba038e-48da-487b-96e8-8d3b99b6d18a",
	uuid:   "10ba038e-48da-487b-96e8-8d3b99b6d18a",
	phone: "+36-70-123-4567",
	action: () => {},
	created: new Date(),
	now: Date.now(),
	raw: Buffer.from([1,2,3])
};

const res = v.validate(obj, schema);

console.log(res, obj);
