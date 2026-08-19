"use strict";

/**
 * Shared helpers for validating and sanitizing schema option values.
 *
 * These utilities provide consistent validation and safe interpolation of
 * schema options across rule files. They throw descriptive errors for invalid
 * (potentially malicious) schema values when called during validator
 * compilation.
 *
 * The escaping helpers (safeStringLiteral) are the safe replacements for raw
 * template interpolation of schema values into generated source code — a
 * primary source of code-injection in this library.
 */

/**
 * Assert that a numeric schema option is a finite number (or null/undefined).
 * Optional `min`/`max` bounds can be supplied.
 */
function assertNumber(type, field, value, { min, max, positive } = {}) {
	if (value == null) return;
	if (typeof value !== "number" || !Number.isFinite(value)) {
		throw new Error(`${type}.${field} must be a number, got ${typeof value === "number" ? "a non-finite number" : typeof value}`);
	}
	if (positive === true && value <= 0) {
		throw new Error(`${type}.${field} must be a positive number`);
	}
	if (min != null && value < min) {
		throw new Error(`${type}.${field} must be >= ${min}`);
	}
	if (max != null && value > max) {
		throw new Error(`${type}.${field} must be <= ${max}`);
	}
	return value;
}

/**
 * Assert an integer (>= 0) numeric option, e.g. string.padStart, padEnd.
 */
function assertNonNegativeInteger(type, field, value) {
	if (value == null) return;
	assertNumber(type, field, value);
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${type}.${field} must be a non-negative integer`);
	}
	return value;
}

/**
 * Assert that a value is a string (or null/undefined).
 */
function assertString(type, field, value) {
	if (value == null) return;
	if (typeof value !== "string") {
		throw new Error(`${type}.${field} must be a string, got ${typeof value}`);
	}
	return value;
}

/**
 * Assert that a value is a boolean (or null/undefined).
 */
function assertBoolean(type, field, value) {
	if (value == null) return;
	if (typeof value !== "boolean") {
		throw new Error(`${type}.${field} must be a boolean, got ${typeof value}`);
	}
	return value;
}

/**
 * Assert that a value is an array (or null/undefined).
 */
function assertArray(type, field, value) {
	if (value == null) return;
	if (!Array.isArray(value)) {
		throw new Error(`${type}.${field} must be an array, got ${typeof value}`);
	}
	return value;
}

/**
 * Assert that a value is a plain object (or null/undefined).
 */
function assertObject(type, field, value) {
	if (value == null) return;
	if (typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${type}.${field} must be an object, got ${Array.isArray(value) ? "array" : typeof value}`);
	}
	return value;
}

/**
 * Safely embed a string (or any JSON-serializable value) into generated source
 * code as a JavaScript string/JSON literal. Prevents string-breakout injection.
 *
 * Example: `value = value.padStart(${schema.padStart}, ${safeStringLiteral(padChar)});`
 */
function safeStringLiteral(value) {
	return JSON.stringify(value);
}

/**
 * Embed an arbitrary (non-string) reactive value safely. For values that may be
 * numbers/booleans, returning them as-is is safe, but strings need quoting.
 * Prefer safeStringLiteral where a string literal is required.
 */
function safeLiteral(value) {
	if (typeof value === "string") return JSON.stringify(value);
	return String(value);
}

/**
 * Resolve a pattern option (string or RegExp) into a RegExp and produce a safe
 * `{ expression, flags }` pair that can be interpolated into generated code as
 * `new RegExp(expression, flags)`. Accepts an optional `allowedFlags` set to
 * prevent dangerous flags (e.g. 'g'/'y' with reused state or 's').
 */
function toRegExp(type, field, value, { allowedFlags, flags } = {}) {
	if (value == null) return null;
	if (typeof value === "string") {
		// string: validate it compiles and return expression + flags from options;
		// extra flags can be supplied by the rule (e.g. schema.patternFlags).
		let re;
		try {
			re = new RegExp(value, flags);
		} catch (e) {
			throw new Error(`Invalid ${type}.${field} regex: ${e.message}`);
		}
		return { expression: JSON.stringify(value), flags: JSON.stringify(re.flags) };
	}
	if (value instanceof RegExp) {
		const flagList = value.flags.split("").sort().join("");
		if (allowedFlags) {
			for (const f of flagList) {
				if (!allowedFlags.includes(f)) {
					throw new Error(`${type}.${field} uses disallowed flag '${f}'`);
				}
			}
		}
		return { expression: JSON.stringify(value.source), flags: JSON.stringify(value.flags) };
	}
	throw new Error(`${type}.${field} must be a string or RegExp object, got ${typeof value}`);
}

/**
 * Escape regex metacharacters so a user-supplied string is matched literally
 * and cannot break out of the surrounding pattern (prevents regex/code
 * injection and ReDoS from characters like ".", "*", "(", "\\", etc.).
 */
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
	assertNumber,
	assertNonNegativeInteger,
	assertString,
	assertBoolean,
	assertArray,
	assertObject,
	safeStringLiteral,
	safeLiteral,
	toRegExp,
	escapeRegExp,
};
