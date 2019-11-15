let Validator = require("../index");

const v = new Validator({ debug: true });

let schema = {};
Object.assign(schema, {
	name: { type: "string" },
	parent: { type: "object", properties: schema, optional: true },
	subcategories: {
		type: "array",
		optional: true,
		items: { type: "object", properties: schema}
	}
});

const check = v.compile(schema);

let category = {};
Object.assign(category, {
	name: "top",
	subcategories: [
		{
			name: "sub1",
			parent: category
		},
		{
			name: "sub2",
			parent: category
		}
	]
});

const category2 = {
	name: "top",
	subcategories: [
		{
			name: "sub1"
		},
		{
			name: "sub2",
			subcategories: [ {} ]
		}
	]
};

console.log("category:", check(category));
console.log("category2:", check(category2));

