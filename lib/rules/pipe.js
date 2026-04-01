"use strict";

/**	Signature: function(value, field, parent, errors, context)
 */
module.exports = function({ schema }, path, context) {
	const steps = Array.isArray(schema && schema.steps) ? schema.steps : [];
	const stepFns = [];

	for (let i = 0; i < steps.length; i++) {
		const rule = this.getRuleFromSchema(steps[i]);
		const innerSrc = `
			current = ${context.async ? "await " : ""}context.fn[%%INDEX%%](current, field, parent, errors, context, label);
		`;

		const body = this.compileRule(rule, context, path, innerSrc, "current");
		stepFns.push(`
			${context.async ? "async " : ""}function step_${i}(current, field, parent, errors, context, label) { ${body} return current; }
		`);
	}

	const src = [];
	src.push(...stepFns);
	src.push(`const fns = [${stepFns.map((_, idx) => `step_${idx}`).join(",")}];`);
	src.push("var current = value;");
	src.push("for (var i = 0; i < fns.length; i++) {");
	src.push("  var before = errors.length;");
	src.push(`  current = ${context.async ? "await " : ""}fns[i](current, field, parent, errors, context, label);`);
	src.push("  if (errors.length > before) { break; }");
	src.push("}");
	src.push("return current;");

	return {
		source: src.join("\n")
	};
};
