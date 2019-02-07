"use strict";

module.exports = function checkObject(value, schema) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return this.makeError("object");
	}

	if (schema.strict === true && schema.props) {
		const allowedProps = Object.keys(schema.props);
		const invalidProps = [];
		const props = Object.keys(value);

		for (let i = 0; i < props.length; i++) {
			if (allowedProps.indexOf(props[i]) === -1) {
				invalidProps.push(props[i]);
			}
		}
		if (invalidProps.length !== 0) {
			return this.makeError("objectStrict", undefined, invalidProps.join(", "));
		}
	}

	return true;
};