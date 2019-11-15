// globals window
let prettier, prettierOpts;
let hljs, hljsOpts;

let mod1 = "prettier"; // rollup
let mod2 = "cli-highlight"; // rollup

module.exports = function(source) {
	if (!prettier) {
		prettier = require(mod1);
		prettierOpts = {
			parser: "babel",
			useTabs: false,
			printWidth: 120,
			trailingComma: "none",
			tabWidth: 4,
			singleQuote: false,
			semi: true,
			bracketSpacing: true
		};

		hljs = require(mod2);
		hljsOpts = {
			language: "js",
			theme: hljs.fromJson({
				keyword: ["white", "bold"],
				built_in: "magenta",
				literal: "cyan",
				number: "magenta",
				regexp: "red",
				string: ["yellow", "bold"],
				symbol: "plain",
				class: "blue",
				attr: "plain",
				function: ["white", "bold"],
				title: "plain",
				params: "green",
				comment: "grey"
			})
		};
	}

	const res = prettier.format(source, prettierOpts);
	return hljs.highlight(res, hljsOpts);
};
