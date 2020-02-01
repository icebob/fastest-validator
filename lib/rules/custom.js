"use strict";

module.exports = function({ schema, messages }, path, context) {
	const src = [];

	if (typeof schema.check == "function") {
		context.customs[path] = { schema, messages };

		src.push(`
			const rule = context.customs["${path}"];
			const res = rule.schema.check.call(this, value, rule.schema, "${path}", parent, context);
			if (Array.isArray(res)) {
				res.forEach(err => errors.push(Object.assign({ message: rule.messages[err.type], field }, err)));
			}

			return value;
		`);
	}

	return {
		source: src.join("\n")
	};
};
