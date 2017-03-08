"use strict";

module.exports = function checkFunction(value, schema) {
	if (typeof value !== "function") {
		return this.makeError("function");
	}

	return true;
};