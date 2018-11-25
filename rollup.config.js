import buble from "rollup-plugin-buble";
import commonjs from "rollup-plugin-commonjs";
import closure from "@ampproject/rollup-plugin-closure-compiler";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const BUNDLE_NAME = "FastestValidator";

// transpile ES2015+ to ES5
const bublePlugin = buble({
	exclude: ["node_modules/**", "examples/**", "dist/**", "test/**", "benchmark/**"]
});

const bundles = [
	// UMD Dev
	{
		input: "index.js",
		output: {
			file: "dist/index.js",
			format: "umd",
			name: BUNDLE_NAME,
			sourcemap: true
		},
		plugins: [
			commonjs(),

			bublePlugin
		]
	},

	// UMD Prod
	{
		input: "index.js",
		output: {
			file: pkg.browser,
			format: "umd",
			name: BUNDLE_NAME
		},
		plugins: [
			commonjs(),

			closure({
				compilationLevel: "SIMPLE",
				languageIn: "ECMASCRIPT6_STRICT",
				languageOut: "ECMASCRIPT5_STRICT",
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
