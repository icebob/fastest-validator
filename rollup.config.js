import resolve from 'rollup-plugin-node-resolve';
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
			name: "fastestvalidator"
		},
		plugins: [
			resolve({
				browser: true,
				extensions: [ '.js', '.json' ]
			}),

			commonjs(),

			// transpile ES2015+ to ES5
			buble({
				exclude: ["node_modules/**"]
			})
		]
	}
];

export default bundles;
