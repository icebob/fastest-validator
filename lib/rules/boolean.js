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
	
	// Check fix value
	if (schema.equal != null && value !== schema.equal) {
		return this.makeError("booleanEqual", schema.equal, value);
	}	

	// Check not fix value
	if (schema.notEqual != null && value === schema.notEqual) {
		return this.makeError("booleanNotEqual", schema.notEqual);
	}	

	return true;
};
