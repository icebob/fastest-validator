export default function (value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return this.makeError("object");
	}

	return true;
};
