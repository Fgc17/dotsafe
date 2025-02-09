import { transpileConfig } from "../utils/transpile-config";
import { loadEnv } from "../utils/load-env";
import { logger } from "../../core/utils/logger";
import { createClient } from "../utils/create-client";

export const generateAction = async (options: { config?: string }) => {
	const config = await transpileConfig(options?.config);

	const { env, envCount } = await loadEnv(config);

	createClient(config, env);

	logger.success(
		`Successfully generated env.ts with ${envCount} environment variables`,
	);
};
