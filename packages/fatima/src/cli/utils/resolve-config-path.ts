import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { parse } from "node:path";
import { logger } from "src/lib/logger/logger";

export function resolveConfigPath(configPath?: string) {
	const baseDir = process.cwd();
	const extensions = [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"];

	if (configPath) {
		const parsed = parse(configPath);

		if (!extensions.includes(parsed.ext)) {
			logger.error(`Invalid given config file extension: ${parsed.ext}`);

			process.exit(1);
		}

		const fullPath = resolve(baseDir, configPath);

		if (!existsSync(fullPath)) {
			logger.error(`Config file doesn't exist: ${fullPath}`);

			process.exit(1);
		}

		return fullPath;
	}

	const baseName = "env.config";

	const foundPaths = extensions
		.map((ext) => resolve(baseDir, baseName + ext))
		.filter((path) => existsSync(path));

	if (foundPaths.length === 0) {
		logger.error(`No config file found on ${baseDir}`);

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
