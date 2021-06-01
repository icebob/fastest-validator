function convertible(value) {
	if (value === undefined) return "";
	if (value === null) return "";
	if (typeof value.toString === "function") return value;
	return typeof value;
}

module.exports = (string, searchValue, newValue) => string.replace(searchValue, convertible(newValue));
