import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
	input: "src/index.js",
	output: {
		name: "fastestvalidator",
		file: "public/bundle.js",
		format: "iife", // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true
	},
	plugins: [
		resolve(),
		commonjs()
	]
};
