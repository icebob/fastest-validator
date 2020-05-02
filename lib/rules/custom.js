"use strict";

module.exports = function ({ schema, messages }, path, context) {
	const src = [];

	src.push(`
		${this.makeCustomValidator({ fnName: "check", path, schema, messages, context })}
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
