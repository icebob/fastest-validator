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
		let tmp;
		for (let key in value) {
	`);

	const keyRule = this.getRuleFromSchema(keyRuleName);
	patchKeyRuleMessages(keyRule);
	const keyInnerSource = `
		tmp = ${context.async ? "await " : ""}context.fn[%%INDEX%%](key, field ? field + "." + key : key, value, errors, context);
	`;
	sourceCode.push(this.compileRule(keyRule, context, null, keyInnerSource, "tmp"));

	const valueRule = this.getRuleFromSchema(valueRuleName);
	const valueInnerSource = `
		tmp = ${context.async ? "await " : ""}context.fn[%%INDEX%%](value[key], field ? field + "." + key : key, value, errors, context);
	`;
	sourceCode.push(this.compileRule(valueRule, context, `${path}[key]`, valueInnerSource, "tmp"));
	sourceCode.push(`
		}
	`);

	return {
		source: sourceCode.join("\n")
	};
};
