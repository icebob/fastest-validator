// globals window
let prettier;

let moduleName = "prettier"; // rollup

module.exports = function(source) {
	if (!prettier)
		prettier = require(moduleName);

	return prettier.format(source, {
		parser: "babel",
		useTabs: false,
		printWidth: 120,
		trailingComma: "none",
		tabWidth: 4,
		singleQuote: false,
		semi: true,
		bracketSpacing: true
	});
};
