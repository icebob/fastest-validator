const Validator = require("../index");

const v = new Validator({
	debug: true,
	useNewCustomCheckerFunction: true,
});

const schema = {
	status: {
		type: "string",
		uppercase: true,
		enum: ["a", "b", "c"],
		//optional: true, // checks "status === undefined"
		//nullable: true, // checks "status === null"
		empty: true
	}
};

const check = v.compile(schema);
const obj = { status: "" };

console.log(check(obj), obj);
