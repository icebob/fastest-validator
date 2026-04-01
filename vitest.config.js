import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["test/**/*.spec.js"],
		exclude: ["test/typescript/**"],
		globals: true,
		coverage: {
			provider: "v8",
			reportsDirectory: "coverage",
		},
	},
});
