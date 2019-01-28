"use strict";

const PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = function checkUUID(value, schema) {
	if (typeof value !== "string")
		return this.makeError("string");

	value = value.toLowerCase();
	if (!PATTERN.test(value))
		return this.makeError("uuid");

	const version = value.charAt(14)|0;
	if(schema.version && schema.version !== version)
		return this.makeError("uuidVersion", schema.version, version);

	switch (version) {
	case 1:
	case 2:
		return true;
	case 3:
	case 4:
	case 5:
		return ["8", "9", "a", "b"].indexOf(value.charAt(19)) !== -1 || this.makeError("uuid");
	}
};