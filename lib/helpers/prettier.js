let prettier;

module.exports = function(source, opts) {
	if (!prettier)
		prettier = require("prettier");

	if (!opts) {
		opts = {
			parser: "babel",
			useTabs: false,
			printWidth: 100,
			trailingComma: "none",
			tabWidth: 4,
			singleQuote: false,
			semi: true,
			bracketSpacing: true
		};
	}

	return prettier.format(source, opts);
};
