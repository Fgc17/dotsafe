import { logger } from "src/core/utils/logger";
import { transpileConfig } from "../utils/transpile-config";

export const reloadAction = async (options: { config?: string }) => {
	const config = await transpileConfig(options.config);

	const port = config.hook?.port;

	await fetch(`http://localhost:${port}/fatima`, {
		method: "POST",
	});

	logger.success("Successfully reloaded environment variables");
};
