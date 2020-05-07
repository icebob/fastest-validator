"use strict";

const PATTERN = /^((([a-f0-9][a-f0-9]+[-]){5}|([a-f0-9][a-f0-9]+[:]){5})([a-f0-9][a-f0-9])$)|(^([a-f0-9][a-f0-9][a-f0-9][a-f0-9]+[.]){2}([a-f0-9][a-f0-9][a-f0-9][a-f0-9]))$/i;

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema, messages }, path, context) {
	return {
		source: `
			if (typeof value !== "string") {
				${this.makeError({ type: "string",  actual: "value", messages })}
				return value;
			}

			var v = value.toLowerCase();
			if (!${PATTERN.toString()}.test(v)) {
				${this.makeError({ type: "mac",  actual: "value", messages })}
			}
			
			return value;
		`
	};
};
