import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import pkg from "./package.json";

const bundles = [
	// browser-friendly UMD build
	{
		input: "index.js",
		output: {
			file: pkg.browser,
			format: "umd",
			name: "FastestValidator"
		},
		plugins: [
			commonjs(),

			// transpile ES2015+ to ES5
			buble({
				exclude: ["node_modules/**", "examples/**", "dist/**", "test/**", "benchmark/**"]
			})
		]
	}
];

export default bundles;
