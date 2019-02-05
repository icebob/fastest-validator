"use strict";

module.exports = function checkBoolean(value, schema) {
	if (schema.convert === true && typeof value !== "boolean") {
		if ([1, 0, "true", "false", "1", "0", "on", "off"].indexOf(value) !== -1)
			return true;
	}

	if (typeof value !== "boolean") {
		return this.makeError("boolean");
	}

	return true;
};
