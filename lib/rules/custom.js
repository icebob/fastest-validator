"use strict";

module.exports = function customCheck(value, schema, _unused1, _unused2, converted) {
	return schema.check.call(this, value, schema, converted);
};