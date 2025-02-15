import { logger } from "src/lib/logger/logger";
import { createAction, type ActionContext } from "../utils/create-action";

export const reloadService = async ({ config }: ActionContext) => {
	const port = config.ports?.reload;

	if (!port) {
		logger.error(
			"Failed to reload environment variables, missing port, please set 'ports.reload' in your fatima config.",
		);
		process.exit(1);
	}

	await fetch(`http://localhost:${config.ports?.reload}/fatima`, {
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

export const reloadAction = createAction(reloadService);
