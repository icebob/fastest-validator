let prettier;

let moduleName = "prettier";

module.exports = function(source, opts) {
	if (!prettier)
		prettier = require(moduleName);

	if (!opts) {
		opts = {
			parser: "babel",
			useTabs: false,
			printWidth: 120,
			trailingComma: "none",
			tabWidth: 4,
			singleQuote: false,
			semi: true,
			bracketSpacing: true
		};
	}

	return prettier.format(source, opts);
};
