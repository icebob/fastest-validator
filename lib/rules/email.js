"use strict";

const PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const QUICK_PATTERN = /^\S+@\S+\.\S+$/;

/*
	Alternative:
		http://codereview.stackexchange.com/questions/38305/validating-email-without-regex
*/

module.exports = function checkEmail(value, schema) {
	if (typeof value !== "string") {
		return this.makeError("string");
	}

	let pattern;

	if (schema.mode == "precise")
		pattern = PRECISE_PATTERN;
	else
		pattern = QUICK_PATTERN;
	
	if (!pattern.test(value)) {
		return this.makeError("email");
	}

	return true;
};