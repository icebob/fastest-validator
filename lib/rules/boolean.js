"use strict";

module.exports = function checkBoolean(value, schema, _unused1, _unused2, converted) {
	if (schema.convert === true && typeof value !== "boolean") {
		switch (value) {
		case 1:
		case "1":
		case "true":
		case "on":
			value = true;
			break;
		case 0:
		case "0":
		case "false":
		case "off":
			value = false;
			break;
		}
	}

	if (typeof value !== "boolean") {
		return this.makeError("boolean");
	}

	if (schema.convert === true && converted !== undefined) {
		converted.value = value;
	}

	return true;
};