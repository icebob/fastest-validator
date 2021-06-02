import { expectAssignable, expectError, expectNotAssignable, expectType } from "tsd";
import Validator, {
	AsyncCheckFunction,
	CompilationRule,
	Context,
	SyncCheckFunction,
	ValidationSchema,
} from "../../";

const validator = new Validator();
type CheckFunction = SyncCheckFunction | AsyncCheckFunction;

// Validator constructor

expectType<Validator>(new Validator({ messages: { numberMin: "c" } }));
expectType<Validator>(
	new Validator({ aliases: { username: { type: "string" } } })
);
expectType<Validator>(
	new Validator({
		customRules: {
			a: (rule, path, context) => {
				expectType<CompilationRule>(rule);
				expectType<string>(path);
				expectType<Context>(context);
				return { source: "", sanitized: true };
			},
		},
	})
);

expectType<Validator>(
	new Validator({
		plugins: [(validator) => expectType<Validator>(validator)],
	})
);

// Validator methods
expectType<void>(
	validator.add("x", (rule, path, context) => {
		expectType<CompilationRule>(rule);
		expectType<string>(path);
		expectType<Context>(context);
		return { source: "", sanitized: true };
	})
);
expectType<void>(
	validator.add("x", (rule, path, context) => {
		expectType<CompilationRule>(rule);
		expectType<string>(path);
		expectType<Context>(context);
		return { source: "", sanitized: true };
	})
);
expectType<CheckFunction>(validator.compile({ foo: "string" }));
expectType<CheckFunction>(validator.compile({ foo: "customT" }));
expectType<CheckFunction>(validator.compile({ foo: { type: "customT", foo: "bar" } }));
expectType<CheckFunction>(
	validator.compile<{ foo: string }>({ foo: "string" })
);
expectType<CheckFunction>(
	validator.compile<{ foo: string }>([{ foo: "string" }])
);
expectType<void>(
	validator.alias("a", { type: "string" })
);

// Schema
expectType<ValidationSchema>({ foo: { type: "string" } });
expectType<ValidationSchema<{ foo: string }>>({ foo: { type: "string" } });
expectNotAssignable<ValidationSchema<{ bar: string }>>({
	foo: { type: "string" },
});

// Basic schema
const check = validator.compile({ foo: { type: "string" } });

// Async schema
validator.compile({ foo: { type: "string" }, $$async: true });

expectAssignable<SyncCheckFunction | AsyncCheckFunction>(check);
