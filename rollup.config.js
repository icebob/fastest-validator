import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import closure from "@ampproject/rollup-plugin-closure-compiler";
import uglify from "rollup-plugin-uglify-es";
import pkg from "./package.json";
import copy from "rollup-plugin-copy";

const BUNDLE_NAME = "FastestValidator";

// transpile ES2015+ to ES5
const bublePlugin = buble({
	exclude: ["node_modules/**", "examples/**", "dist/**", "test/**", "benchmark/**"]
});

// copy typescript definitions
const copyPlugin = copy({
	targets: [
		{ src: "index.d.ts", dest: "dist" },
	],
	verbose: true,
	copyOnce: true,
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

			bublePlugin,
			copyPlugin
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
			copyPlugin,

			uglify()
		]
	}
];

export default bundles;
