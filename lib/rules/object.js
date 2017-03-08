"use strict";

module.exports = function checkObject(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return this.makeError("object");
	}

	return true;
};