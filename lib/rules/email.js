"use strict";

/* eslint no-useless-escape: off */
const PRECISE_PATTERN = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const BASIC_PATTERN = /^\S+@\S+\.\S+$/;

module.exports = function checkEmail(value, schema) {
	if (typeof value !== "string") {
		return this.makeError("string");
	}

	let pattern = BASIC_PATTERN;
	if (schema.mode === "precise")
		pattern = PRECISE_PATTERN;

	if (!pattern.test(value)) {
		return this.makeError("email");
	}

	return true;
};
