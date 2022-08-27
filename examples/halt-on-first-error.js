"use strict";
const Validator = require("../index");
const v = new Validator({
	haltOnFirstError: true,
	debug: false,
	useNewCustomCheckerFunction: true
});

const schema = {
	id: { type: "number", min: 8, max: 101 },
	name: { type: "string", optional: false, min: 5, max: 128 },
	settings: { type: "object", props: {
		notify: [
			{ type: "boolean" },
			{ type: "object" }
		]
	}},
	multi: [
		{ type: "string", min: 3, max: 255 },
		{ type: "boolean" }
	],
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
	id: 5, // expect error min 8
	name: "John", // expect error min len 5
	sex: "N/A", // expect error
	sex2: "invalid", // expect error
	settings: {
		//notify: true,
		notify: {
			corner: "top"
		}
	},
	multi: "AA", // expect error
	roles: [
		"reader" // expect error
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
