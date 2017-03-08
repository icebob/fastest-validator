"use strict";

module.exports = function checkBoolean(value, schema) {
	if (schema.convert === true && typeof value !== "boolean") {
		if (
			value === 1
		|| value === 0
		|| value === "true"
		|| value === "false"
		|| value === "1"
		|| value === "0"
		|| value === "on"
		|| value === "off"
		) 
			return true;
	}
	
	if (typeof value !== "boolean") {
		return this.makeError("boolean");
	}

	return true;
};