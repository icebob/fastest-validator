import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import closure from "rollup-plugin-closure-compiler-js";
import uglify from "rollup-plugin-uglify-es";
import pkg from "./package.json";

const BUNDLE_NAME = "FastestValidator";

// transpile ES2015+ to ES5
const bublePlugin = buble({
	exclude: ["node_modules/**", "examples/**", "dist/**", "test/**", "benchmark/**"]
});

const bundles = [
	// browser-friendly UMD build, suitable for dev
	{
		input: "index.js",
		output: {
			file: "dist/browser/index.js",
			format: "umd",
			name: BUNDLE_NAME
		},
		plugins: [
			commonjs(),

			bublePlugin
		],

		sourceMap: true
	},

	// Browser Minification version, suitable for production
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

			uglify()
		]
	}
];

export default bundles;
