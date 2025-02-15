import { logger } from "src/lib/logger/logger";
import { createAction, type ActionContext } from "../utils/create-action";

export const reloadService = async ({ config }: ActionContext) => {
	await fetch(`http://localhost:${config.hook?.port}/fatima`, {
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
