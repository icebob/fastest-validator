"use strict";

module.exports = function ({ schema, messages, index }, path, context) {
	const src = [];

	src.push(`
		${this.makeCustomValidator({ fnName: "check", path: path != null ? path : "null", schema, messages, context, ruleIndex: index })}
		return value;
	`);

	return {
		source: src.join("\n")
	};
};
