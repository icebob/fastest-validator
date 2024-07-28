let Validator = require("../index");


let v = new Validator({
	debug: true,
	useNewCustomCheckerFunction: true,
	messages: {
		// Register our new error message text
		evenNumber: "The '{field}' field must be an even number! Actual: {actual}",
		realNumber: "The '{field}' field must be a real number! Actual: {actual}",
		notPermitNumber: "The '{field}' cannot have the value {actual}",
	},
	customFunctions:{
		even: (value, errors)=>{
			if(value % 2 != 0 ){
				errors.push({ type: "evenNumber",  actual: value });
			}
			return value;
		},
		real: (value, errors)=>{
			if(value <0 ){
				errors.push({ type: "realNumber",  actual: value });
			}
			return value;
		}
	}
});



const schema = {
	people:{
		type: "number",
		custom: [
			"even",
			"real",
			function (value, errors){
				if(value === "3" ){
					errors.push({ type: "notPermitNumber",  actual: value });
				}
				return value;
			}
		]
	}
};

console.log(v.validate({people:5}, schema));
console.log(v.validate({people:-5}, schema));
console.log(v.validate({people:3}, schema));
