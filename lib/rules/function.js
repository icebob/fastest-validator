"use strict";

module.exports = function checkFunction(value) {
	if (typeof value !== "function") {
		return this.makeError("function");
	}

	return true;
};