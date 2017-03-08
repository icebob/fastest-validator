"use strict";

module.exports = function checkDate(value, schema) {
	if (schema.convert === true && !(value instanceof Date)) {
		value = new Date(value);
	}
	
	if (!(value instanceof Date)) {
		return this.makeError("date");
	}

	if (isNaN(value.getTime())) {
		return this.makeError("date");
	}

	return true;
};