export default function (value) {
	if (value !== null && value !== undefined) {
		return this.makeError("forbidden");
	}

	return true;
};
