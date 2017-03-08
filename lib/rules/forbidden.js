"use strict";

module.exports = function checkForbidden(value) {
	if (value !== null && value !== undefined) {
		return this.makeError("forbidden");
	}

	return true;
};