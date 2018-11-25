export default function (value) {
	if (typeof value !== "function") {
		return this.makeError("function");
	}

	return true;
};
