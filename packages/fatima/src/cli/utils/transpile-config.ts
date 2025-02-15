import { createJiti, type Jiti, type JitiOptions } from "jiti";
import { logger } from "src/lib/logger/logger";
import { resolveConfigPath } from "./resolve-config-path";
import { createRequire } from "node:module";
import { isFatimaConfig, type FatimaConfig } from "src/core/config";

const require = createRequire(import.meta.url);

export async function transpileConfig(
	configPath?: string,
): Promise<FatimaConfig> {
	const originalEnv = { ...process.env };

	const path = resolveConfigPath(configPath);

	let jiti: Jiti;

	const plugins = [];

	try {
		const pluginPath = require.resolve(
			"@babel/plugin-transform-class-properties",
		);

		const pluginTransformClassProperties = await import(pluginPath)
			.then((mod) => mod.default)
			.catch(() => {});

		plugins.push(pluginTransformClassProperties);
	} catch {}

	const jitiOptions: JitiOptions = {
		interopDefault: true,
		fsCache: false,
		transformOptions: {
			ts: true,
			babel: {
				plugins,
			},
		},
	};

	try {
		jiti = createJiti(import.meta.url, {
			...jitiOptions,
			tryNative: true,
		});
	} catch {
		jiti = createJiti(import.meta.url, jitiOptions);
	}

	try {
		const config = (await jiti.import(path, {
			default: true,
		})) satisfies FatimaConfig;

		process.env = originalEnv;

		if (!isFatimaConfig(config)) {
			logger.error(
				"Config file must be created with the fatima config function.",
			);
			process.exit(1);
		}

		return config;
	} catch (error) {
		logger.error(error.message);
		logger.error("Failed to read config file, check if it exists.");
		process.exit(1);
	}
}
