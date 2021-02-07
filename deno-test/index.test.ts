import FastestValidator from "https://esm.sh/fastest-validator";
import { assert } from "https://deno.land/std/testing/asserts.ts";

Deno.test({
	name: "deno basic",
	fn: () => {
		const v = new FastestValidator();
		const check = v.compile({
			name: "string",
			age: "number",
		});

		assert(check({ name: "Erf", age: 18 }) === true);
		assert(Array.isArray(check({ name: "Erf" })) === true);
		assert(Array.isArray(check({ name: "18" })) === true);
	},
});
