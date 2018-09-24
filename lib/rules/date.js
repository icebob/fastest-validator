"use strict";

module.exports = function checkDate(value, schema, _unused1, _unused2, converted) {
	if (schema.convert === true && !(value instanceof Date)) {
		value = new Date(value);
	}
	
	if (!(value instanceof Date)) {
		return this.makeError("date");
	}

	if (isNaN(value.getTime())) {
		return this.makeError("date");
	}

	if (schema.convert === true && converted !== undefined) {
		converted.value = value;
	}

	return true;
};