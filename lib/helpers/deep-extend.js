"use strict";

function isObjectHasKeys(v) {
	if (typeof v !== "object" || Array.isArray(v) || v == null) return false;
	return Object.keys(v).length > 0;
}

function deepExtend(destination, source, options = {}) {
	for (let property in source) {
		if (isObjectHasKeys(source[property])) {
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
