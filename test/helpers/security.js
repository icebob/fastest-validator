"use strict";

/**
 * Helpers for security-focused tests.
 *
 * The core job of these tests is to prove that a validator never lets a
 * (potentially hostile) schema option break out of the code that is generated
 * via `new Function(...)`. If a value is interpolated unescaped, the produced
 * source becomes invalid JavaScript (SyntaxError) or (worse) can execute the
 * attacker's payload.
 *
 * Because the generated code is only *compiled* (not run) by the library, real
 * payloads never execute during a normal compile. To observe injection through
 * a black-box `v.compile(...)` call we therefore rely on two signals:
 *   - a SyntaxError (or any error) thrown by the compiler, and
 *   - an observable side effect of the injected payload (see `globalSink`).
 */

/**
 * Mutable sentinel object placed on `global`. Injected payloads may attempt to
 * write to it (e.g. `global.__FV_INJECTED__.fired = true`). `attempt()` resets
 * it before every run so one payload cannot poison the next.
 */
const globalSink = { fired: false };

function resetGlobalSink() {
	globalSink.fired = false;
}

/**
 * Battery of payloads that attempt to break out of a generated string / regex
 * / numeric literal and run code. These are the classic injection vectors for a
 * library that interpolates schema values into `new Function(...)` source.
 * Array elements are `[label, value]`.
 */
const INJECTION_PAYLOADS = [
	["double quote",       "\"); global.__FV_INJECTED__.fired = true; //"],
	["double quote alt",   "\"; global.__FV_INJECTED__.fired = true; //"],
	["single quote",       "'); global.__FV_INJECTED__.fired = true; //"],
	["single quote alt",   "'; global.__FV_INJECTED__.fired = true; //"],
	["backtick",           "`); global.__FV_INJECTED__.fired = true; //`"],
	["template literal",   "${global.__FV_INJECTED__.fired = true}"],
	["close brace",        "}); global.__FV_INJECTED__.fired = true; //"],
	["close paren",        ")); global.__FV_INJECTED__.fired = true; //"],
	["semicolon",          "; global.__FV_INJECTED__.fired = true; //"],
	["comment + code",     "// global.__FV_INJECTED__.fired = true"],
	["line break + code",  "\n global.__FV_INJECTED__.fired = true; //"],
	["newline",            "\n; global.__FV_INJECTED__.fired = true; //"],
	["carriage return",    "\rglobal.__FV_INJECTED__.fired = true; //"],
	["json breakout",      "{\"x\":\"\\\"); global.__FV_INJECTED__.fired = true; //\"}"],
	["unicode escape",     "\\u0027); global.__FV_INJECTED__.fired = true; //"],
	["hex escape",         "\\x27); global.__FV_INJECTED__.fired = true; //"],
	["regex slash",        ".*); global.__FV_INJECTED__.fired = true; //"],
	["regex newline",      "\\n.*\"), (global.__FV_INJECTED__.fired = true); //("],
	["regex lookahead",    "(?=.*)); global.__FV_INJECTED__.fired = true; //"],
];

// Install the sink on global so payload strings can reference it directly.
global.__FV_INJECTED__ = globalSink;

/**
 * Run `fn` inside an environment that will detect both thrown errors and side
 * effects of injected code.
 *
 * @param {Function} fn The callback to run (typically a `v.compile(...)` call).
 * @returns {{threw: boolean, error?: Error, executed: boolean}}
 */
function attempt(fn) {
	resetGlobalSink();
	/* eslint-disable no-console */
	const prevConsole = console.log;
	let consoleCalls = 0;
	console.log = function () {
		consoleCalls++;
		return prevConsole.apply(console, arguments);
	};
	/* eslint-enable no-console */

	let threw = false;
	let error;
	try {
		fn();
	} catch (e) {
		threw = true;
		error = e;
	} finally {
		/* eslint-disable no-console */
		console.log = prevConsole;
		/* eslint-enable no-console */
	}

	return {
		threw,
		error,
		// Every injection payload signals execution by writing
		// `global.__FV_INJECTED__.fired = true`, so a strict boolean check is the
		// detection contract shared between the payloads and this harness.
		executed: globalSink.fired === true,
		consoleCalls,
	};
}

/**
 * Assert that `fn` does not allow injected code to run. Failures that leak a
 * SyntaxError (meaning the payload reached the generated source) are reported
 * with a clear message.
 *
 * @param {Function} fn
 * @param {string} [contextLabel] Human-readable description shown on failure.
 */
function expectNoCodeExecution(fn, contextLabel) {
	const res = attempt(fn);
	const what = contextLabel ? ` (${contextLabel})` : "";
	if (res.executed) {
		throw new Error(
			`INJECTED CODE EXECUTED${what}: a schema payload wrote to the global sink. ` +
			"This is a code-injection vulnerability in the generated code."
		);
	}
	if (res.consoleCalls > 0) {
		throw new Error(
			`UNEXPECTED CONSOLE OUTPUT${what}: an injected payload called console.log. ` +
			"This suggests generated code executed foreign code."
		);
	}
	if (res.threw && res.error instanceof SyntaxError) {
		throw new Error(
			`SYNTAX ERROR IN GENERATED CODE${what}: the injected value was interpolated ` +
			"unescaped into the compiled source.\n" +
			`  ${res.error.message}`
		);
	}
	return res;
}

module.exports = {
	INJECTION_PAYLOADS,
	attempt,
	expectNoCodeExecution,
	resetGlobalSink,
};
