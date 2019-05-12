"use strict";

function convertBoolean(value) {
	if (value === "on") return true;
	if (value === "off") return false;

	if (value === "true") return true;
	if (value === "false") return false;

	if (value === "1") return true;
	if (value === "0") return false;

	if (value === "1") return true;
	if (value === "0") return false;

	return value;
}

function convertNumber(value) {
	return Number(value);
}

module.exports = {
	"boolean": convertBoolean,
	"number": convertNumber,
};
