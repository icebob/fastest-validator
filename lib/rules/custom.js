export default function (value, schema) {
	return schema.check.call(this, value, schema);
};
