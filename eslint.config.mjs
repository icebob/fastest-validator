import globals from "globals";
import js from "@eslint/js";

export default [
	js.configs.recommended,
	{
		files: ["lib/**/*.js", "test/**/*.js"],
		languageOptions: {
			ecmaVersion: 2018,
			sourceType: "commonjs",
			globals: {
				...globals.node,
				...globals.commonjs,
				...globals.es6,
			}
		},
		rules: {
			"indent": ["warn", "tab"],
			"quotes": ["warn", "double"],
			"semi": ["error", "always"],
			"no-var": ["error"],
			"no-console": ["error"],
			"no-unused-vars": ["warn"]
		}
	},
	{
		files: ["test/**/*.js"],
		languageOptions: {
			globals: {
				describe: "readonly",
				it: "readonly",
				expect: "readonly",
				vi: "readonly",
				beforeAll: "readonly",
				afterAll: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
			}
		},
		rules: {
			"no-useless-escape": "off"
		}
	}
];
