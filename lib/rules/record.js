function patchKeyRuleMessages(rule) {
	for (const type in rule.messages) {
		if (type.startsWith("string")) {
			rule.messages[type] = rule.messages[type].replace(" field ", " key ");
		}
	}
}

module.exports = function compileRecordRule({ schema, messages }, path, context) {
	const sourceCode = [];
	sourceCode.push(`
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			${this.makeError({ type: "record", actual: "value", messages })}
			return value;
		}
	`);

	const keyRuleName = schema.key || "string";
	const valueRuleName = schema.value || "any";

	sourceCode.push(`
		const record = value;
		let sanitizedKey, sanitizedValue;
		const result = {};
		for (let key in value) {
	`);

	sourceCode.push("sanitizedKey = value = key;");

	const keyRule = this.getRuleFromSchema(keyRuleName);
	patchKeyRuleMessages(keyRule);
	const keyInnerSource = `
		sanitizedKey = ${context.async ? "await " : ""}context.fn[%%INDEX%%](key, field ? field + "." + key : key, record, errors, context);
	`;
	sourceCode.push(this.compileRule(keyRule, context, null, keyInnerSource, "sanitizedKey"));
	sourceCode.push("sanitizedValue = value = record[key];");

	const valueRule = this.getRuleFromSchema(valueRuleName);
	const valueInnerSource = `
		sanitizedValue = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value, field ? field + "." + key : key, record, errors, context);
	`;
	sourceCode.push(this.compileRule(valueRule, context, `${path}[key]`, valueInnerSource, "sanitizedValue"));
	sourceCode.push("result[sanitizedKey] = sanitizedValue;");
	sourceCode.push(`
		}
	`);
	sourceCode.push("return result;");

	return {
		source: sourceCode.join("\n")
	};
};
