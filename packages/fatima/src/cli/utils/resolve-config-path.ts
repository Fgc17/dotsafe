import { resolve } from "path";
import { existsSync } from "fs";
import { parse } from "path";
import { logger } from "src/core/utils/logger";

export function resolveConfigPath(configPath?: string) {
	const baseDir = process.cwd();
	const extensions = [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"];

	if (configPath) {
		const parsed = parse(configPath);

		if (parsed.ext in extensions) {
			const fullPath = resolve(baseDir, configPath);
			if (!existsSync(fullPath)) {
				logger.error(`Config file not found at ${fullPath}`);

				process.exit(1);
			}
			return fullPath;
		}
	}

	const baseName = configPath ?? "env.config";

	const foundPaths = extensions
		.map((ext) => resolve(baseDir, baseName + ext))
		.filter((path) => existsSync(path));

	if (foundPaths.length === 0) {
		logger.error(`Config file not found at ${baseDir}`);

		process.exit(1);
	}

	if (foundPaths.length > 1) {
		logger.error(
			`Multiple config files found at ${baseDir}, please use only one.`,
		);

		process.exit(1);
	}

	return foundPaths[0];
}
