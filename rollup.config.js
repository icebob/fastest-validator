import buble from "rollup-plugin-buble";
import closure from "@ampproject/rollup-plugin-closure-compiler";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

// transpile ES2015+ to ES5
const bublePlugin = buble({
	exclude: ["node_modules/**", "examples/**", "dist/**", "test/**", "benchmark/**"]
});

const bundles = [
	// CommonJS (main)
	{
		input: "lib/validator.js",
		output: {
			file: pkg.main,
			format: "cjs"
		},
		plugins: [
			bublePlugin
		]
	},

	// ESM (module)
	{
		input: "lib/validator.js",
		output: {
			file: pkg.module,
			format: "es"
		},
		plugins: [
			bublePlugin
		]
	},

	// UMD (browser)
	{
		input: "lib/validator.js",
		output: {
			file: pkg.browser,
			name: "FastestValidator",
			format: "umd"
		},
		plugins: [
			closure({
				compilationLevel: "SIMPLE",
				languageIn: "ECMASCRIPT6_STRICT",
				languageOut: "ECMASCRIPT5",
				env: "BROWSER",
				warningLevel: "QUIET",
				assumeFunctionWrapper: true,
				applyInputSourceMaps: false,
				useTypesForOptimization: false,
				processCommonJsModules: false,
			}),

			bublePlugin,

			terser({
				toplevel: true
			})
		]
	}
];

export default bundles;
