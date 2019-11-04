"use strict";

module.exports = function customCheck(schema, path, messages, context) {
	const src = [];

	if (typeof schema.check == "function") {
		context.customs[path] = { schema, messages };
	}

	src.push(`
		const rule = context.customs["${path}"];
		const res = rule.schema.check.call(this, value, rule.schema, "${path}", parent, data);
		if (Array.isArray(res)) {
			res.forEach(err => errors.push(Object.assign({ message: rule.messages[err.type] }, err)));
		}
	`);

	return {
		source: src.join("\n")
	};
};
