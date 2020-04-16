"use strict";

function isObject(v) {
	return v != null && v.constructor.name === "Object";
}

function deepExtend(destination, source, options = {}) {
	for (let property in source) {
		if (isObject(source[property]) && source[property] !== null) {
			destination[property] = destination[property] || {};
			deepExtend(destination[property], source[property], options);
		} else {
			if (options.skipIfExist === true && destination[property] !== undefined) continue;
			destination[property] = source[property];
		}
	}
	return destination;
}

module.exports = deepExtend;
