import { defineConfig } from "tsup";
import copyPlugin from "esbuild-plugin-copy";

export default defineConfig({
	entry: ["src/bin.ts"],
	shims: true,
	clean: true,
	esbuildPlugins: [
		copyPlugin({
			resolveFrom: "cwd",
			assets: {
				from: ["./src/templates/**/*"],
				to: ["./dist/templates"],
			},
		}),
	],
});
