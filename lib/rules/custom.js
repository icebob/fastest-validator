"use strict";

module.exports = function customCheck(value, schema) {
	return schema.check.call(this, value, schema);
};