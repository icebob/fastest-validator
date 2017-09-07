"use strict";

/**
 * Flatten an array
 * @param {Array} array
 * @param {Array} target
 * @returns Array flattened array
 */
function flatten(array, target) {
	const result = target || [];

	for (let i = 0; i < array.length; ++i) {
		if (Array.isArray(array[i])) {
			flatten(array[i], result);
		}
		else {
			result.push(array[i]);
		}
	}

	return result;
}

module.exports = flatten;
