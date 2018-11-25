export default function (value, schema) {

	if (schema.values != null && schema.values.indexOf(value) === -1) {
		return this.makeError("enumValue", schema.values, value);
	}

	return true;
};
