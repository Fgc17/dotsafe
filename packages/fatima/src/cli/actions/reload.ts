import { logger } from "src/core/utils/logger";
import { transpileConfig } from "../utils/transpile-config";

export const reloadAction = async (options: { config?: string }) => {
	const config = await transpileConfig(options.config);

	const port = config.hook?.port;

	await fetch(`http://localhost:${port}/fatima`, {
		method: "POST",
	})
		.then((res) => {
			if (res.status !== 200) {
				throw "err";
			}

			logger.success("Successfully reloaded environment variables");
		})
		.catch(() => {
			logger.error(
				`Failed to reload environment variables, did you run 'fatima dev'?`,
			);
			process.exit(1);
		});
};
