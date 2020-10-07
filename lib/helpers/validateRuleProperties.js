let fv;

const commonProps = {
	type: "string",
	optional: "boolean|optional",
	nullable: "boolean|optional",
	messages: "object|optional",
	default: "any|optional",
	custom: "function|optional",
};

/**
 * Validates Rule properties
 * @param {validator} validator
 * @param {Object} schema
 * @param {Object} properties
 * @returns true or array of error
 */

module.exports = function validateRuleProperties(FV, schema, properties) {
	if (!fv) {
		fv = new FV({ strict: false });
	}

	schema = {
		$$root: true,
		type: "object",
		props: Object.assign(schema, commonProps),
	};

	return fv.validate(properties, schema);
};
