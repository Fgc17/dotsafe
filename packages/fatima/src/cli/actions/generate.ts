import { logger } from "../../core/utils/logger";
import { createAction, type ActionContext } from "../utils/create-action";
import { createClient } from "../utils/create-client";
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
