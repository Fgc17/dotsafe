import { spawn } from "node:child_process";
import { logger } from "../../core/utils/logger";
import { transpileConfig } from "../utils/transpile-config";
import { loadEnv } from "../utils/load-env";
import { createInjectableEnv } from "../utils/env-patch";

export const runAction = async (
	options: { config: string; generate: boolean },
	args: string[],
) => {
	const config = await transpileConfig(options.config);

	const { env, envCount } = await loadEnv(config);

	logger.success(`Loaded ${envCount} environment variables`);

	const cmd = args.shift();

	const injectableEnv = createInjectableEnv(env);

	const child = spawn(cmd as string, [...args], {
		env: injectableEnv,
		shell: true,
		stdio: "inherit",
	});

	child.on("error", (error) => {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	});

	child.on("close", (code) => {
		if (code !== 0) {
			console.error(`Command exited with code ${code}`);
			process.exit(code);
		}
	});
};
