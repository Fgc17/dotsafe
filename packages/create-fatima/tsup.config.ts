import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/bin/bin.ts"],
	shims: true,
	clean: true,
});
