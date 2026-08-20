"use strict";

/**
 * Validate schema options at compile time and safely embed them in generated
 * code (prevents code injection).
 */

/**
 * Assert a numeric option is finite (null/undefined allowed); optional
 * `min`/`max`/`positive` constraints.
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
 * Assert a non-negative integer option (e.g. string.padStart, padEnd).
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
 * Assert a value is a string (null/undefined allowed).
 */
function assertString(type, field, value) {
	if (value == null) return;
	if (typeof value !== "string") {
		throw new Error(`${type}.${field} must be a string, got ${typeof value}`);
	}
	return value;
}

/**
 * Assert a value is a boolean (null/undefined allowed).
 */
function assertBoolean(type, field, value) {
	if (value == null) return;
	if (typeof value !== "boolean") {
		throw new Error(`${type}.${field} must be a boolean, got ${typeof value}`);
	}
	return value;
}

/**
 * Assert a value is an array (null/undefined allowed).
 */
function assertArray(type, field, value) {
	if (value == null) return;
	if (!Array.isArray(value)) {
		throw new Error(`${type}.${field} must be an array, got ${typeof value}`);
	}
	return value;
}

/**
 * Assert a value is a plain object, not an array (null/undefined allowed).
 */
function assertObject(type, field, value) {
	if (value == null) return;
	if (typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${type}.${field} must be an object, got ${Array.isArray(value) ? "array" : typeof value}`);
	}
	return value;
}

/**
 * Embed a value as a JSON/JS string literal in generated code (prevents
 * string-breakout). e.g. `value.padStart(${safeStringLiteral(padChar)})`.
 */
function safeStringLiteral(value) {
	return JSON.stringify(value);
}

/**
 * Embed a non-string value safely: strings are JSON-quoted, other values are
 * safe as-is via String(). Prefer safeStringLiteral where a literal is needed.
 */
function safeLiteral(value) {
	if (typeof value === "string") return JSON.stringify(value);
	return String(value);
}

/**
 * Convert a string or RegExp pattern option into a JSON-safe
 * `{expression, flags}` pair for `new RegExp(...)` in generated code; the
 * optional `allowedFlags` set rejects dangerous flags (e.g. 'g'/'y', 's').
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
 * Escape regex metacharacters so a user string is matched literally (prevents
 * regex breakout / ReDoS).
 */
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Escape the four JS line terminators so a value can be embedded in a `//`
 * comment in generated code. JSON.stringify leaves U+2028/U+2029 raw, but they
 * still terminate a line comment and would cause a SyntaxError.
 */
function escapeLineComment(value) {
	return value.replace(/[\n\r\u2028\u2029]/g, "\\n");
}

/**
 * Safe own-property lookup: never resolves through the prototype chain.
 * Prevents type confusion when schema types are named "constructor", "__proto__", etc.
 */
function hasOwn(obj, key) {
	return Object.prototype.hasOwnProperty.call(obj, key);
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
	escapeLineComment,
	hasOwn,
};
