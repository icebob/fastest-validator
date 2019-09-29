"use strict";

const PATTERN = /^((([a-f0-9][a-f0-9]+[-]){5}|([a-f0-9][a-f0-9]+[:]){5})([a-f0-9][a-f0-9])$)|(^([a-f0-9][a-f0-9][a-f0-9][a-f0-9]+[.]){2}([a-f0-9][a-f0-9][a-f0-9][a-f0-9]))$/i;

module.exports = function checkMAC(value, schema) {
	if (typeof value !== "string")
		return this.makeError("string");

	value = value.toLowerCase();
	if (!PATTERN.test(value))
		return this.makeError("mac");

	return true;
};
