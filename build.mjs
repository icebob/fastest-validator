import { buildSync } from "esbuild";
import { copyFileSync, mkdirSync, writeFileSync } from "fs";

const UMD_HEADER = `(function (root, factory) {
	if (typeof define === 'function' && define.amd) { define([], factory); }
	else if (typeof module === 'object' && module.exports) { module.exports = factory(); }
	else { root.FastestValidator = factory(); }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
`;

const UMD_FOOTER = `}));
`;

mkdirSync("dist", { recursive: true });

function build(minify) {
	const outfile = minify ? "dist/index.min.js" : "dist/index.js";

	const result = buildSync({
		entryPoints: ["index.js"],
		bundle: true,
		platform: "node",
		format: "iife",
		globalName: "FastestValidator",
		outfile,
		sourcemap: !minify,
		minify,
		write: false,
		target: "es2015",
	});

	// esbuild with globalName produces:
	//   var FastestValidator = (() => { ... return require_xxx(); })();
	// We wrap it so the UMD factory returns the value.
	let code = result.outputFiles.find(f => f.path.endsWith(".js")).text;

	// Strip sourceMappingURL comment (we'll re-add for dev build)
	const sourcemapComment = code.match(/\/\/# sourceMappingURL=.*\n?/)?.[0] || "";
	code = code.replace(/\/\/# sourceMappingURL=.*\n?/, "");

	// Wrap: UMD header + original IIFE (assigned to var) + return it + UMD footer
	const umdCode = UMD_HEADER + code + "return FastestValidator;\n" + UMD_FOOTER + sourcemapComment;
	writeFileSync(outfile, umdCode);

	// Write sourcemap with line offset correction for UMD header
	const sourcemapFile = result.outputFiles.find(f => f.path.endsWith(".map"));
	if (sourcemapFile) {
		const headerLines = UMD_HEADER.split("\n").length - 1;
		const map = JSON.parse(sourcemapFile.text);
		map.mappings = ";".repeat(headerLines) + map.mappings;
		writeFileSync(outfile + ".map", JSON.stringify(map));
	}

	console.log(`Built ${outfile} (${(umdCode.length / 1024).toFixed(1)} KB)`);
}

// Dev build (with sourcemap)
build(false);

// Prod build (minified, no sourcemap)
build(true);

// Copy TypeScript definitions
copyFileSync("index.d.ts", "dist/index.d.ts");
console.log("Copied index.d.ts -> dist/index.d.ts");
