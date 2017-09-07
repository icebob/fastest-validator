"use strict";

function deepExtend(destination, source) {
	for (let property in source) {
		if (typeof source[property] === "object" &&
			source[property] !== null) {
			destination[property] = destination[property] || {};
			deepExtend(destination[property], source[property]);
		} else {
			destination[property] = source[property];
		}
	}
	return destination;
}

module.exports = deepExtend;