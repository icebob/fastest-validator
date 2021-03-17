"use strict";

const PATTERN = /^https?:\/\/\S+/;
//const PATTERN = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
//const PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function ({ schema, messages }, path, context) {
	const src = [];

	src.push(`
		if (typeof value !== "string") {
			${this.makeError({ type: "string", actual: "value", messages })}
			return value;
		}
	`);

	if (!schema.empty) {
		src.push(`
			if (value.length === 0) {
				${this.makeError({ type: "urlEmpty", actual: "value", messages })}
				return value;
			}
		`);
	} else {
		src.push(`
			if (value.length === 0) return value;
		`);
	}

	src.push(`
		if (!${PATTERN.toString()}.test(value)) {
			${this.makeError({ type: "url", actual: "value", messages })}
		}

		return value;
	`);

	return {
		source: src.join("\n"),
	};
};
