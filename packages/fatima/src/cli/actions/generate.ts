import { logger } from "src/lib/logger/logger";
import { createAction, type ActionContext } from "../utils/create-action";
import { createClient } from "src/lib/client/generate-client";
import { validateService } from "./validate";

export const generateService = async (ctx: ActionContext) => {
	const { env, config, envCount } = ctx;

	if (config.validate) {
		await validateService(ctx);
	}

	createClient(config, env);

	logger.success(
		`Successfully generated env.ts with ${envCount} environment variables`,
	);
};

export const generateAction = createAction(generateService);
