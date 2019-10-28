"use strict";

module.exports = function customCheck(schema, path, messages, context) {
	const src = [];

	if (typeof schema.check == "function") {
		context.customs[path] = schema;
	}

	src.push(`
		const schema = context.customs["${path}"];
		const res = schema.check.call(this, value, schema, "${path}", parent, data);
		if (Array.isArray(res)) {
			res.forEach(err => errors.push(Object.assign({ message: schema.messages[err.type] }, err)));
		}
	`);

	return {
		source: src.join("\n")
	};
};
