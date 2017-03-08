"use strict";

module.exports = function checkForbidden(value, schema) {
	if (value !== null && value !== undefined) {
		return this.makeError("forbidden");
	}

	return true;
};