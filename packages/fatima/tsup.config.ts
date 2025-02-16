import { defineConfig } from "tsup";

const createEntries = (...entries: string[]) => {
	return entries.map((entry) => {
		return `src/${entry}/${entry}.ts`;
	});
};

export default defineConfig({
	entry: createEntries("core", "cli", "env", "instrumentation"),
	dts: true,
	shims: true,
	clean: true,
});
