const Validator = require("../index");

const v = new Validator({
	debug: true,
	useNewCustomCheckerFunction: true,
});

const schema = {
	dateString: [
		{ type: "string", nullable: true },
		{ type: "boolean", nullable: true }
	]
};

check = v.compile(schema);

console.log("Boolean:", check({ dateString: true })); // Valid
console.log("Date:", check({ dateString: new Date().toISOString() })); // Valid
console.log("Null:", check({ dateString: null })); // Fail

