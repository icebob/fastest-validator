"use strict";

function deepExtend(destination, source, options = {}) {
	for (let property in source) {
		if (typeof source[property] === "object" && source[property] !== null) {
			destination[property] = destination[property] || {};
			deepExtend(destination[property], source[property], options);
		} else {
			if (options.skipIfExist === true && destination[property] !== undefined ) continue;
			destination[property] = source[property];
		}
	}
	return destination;
}

module.exports = deepExtend;
