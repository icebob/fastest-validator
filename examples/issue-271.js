const Validator = require("../index");

const v = new Validator({
	debug: true,
	useNewCustomCheckerFunction: true,
});

const schema = {
	$$strict: true,
	extra: { type: "string", custom: value => value }
};

const check = v.compile(schema);

const obj = {};
const res = check(obj);

console.log(obj);
