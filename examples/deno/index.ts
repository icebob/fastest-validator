import FastestValidator from "https://esm.sh/fastest-validator";

const v = new FastestValidator();
const check = v.compile({
	name: "string",
	age: "number",
});

console.log(check({ name: "Erf", age: 18 }));
console.log(check({ name: "Erf" }));
console.log(check({ name: "Erf", age: "18" }));
