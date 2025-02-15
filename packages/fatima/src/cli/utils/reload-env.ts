import { lifecycle } from "src/core/lifecycle";
import { logger } from "src/lib/logger/logger";
import { loadEnv } from "src/lib/env/load-env";
import { createClient } from "src/lib/client/generate-client";
import { parseValidationErrors } from "src/lib/utils/parse-validation";
import { fatimaStore } from "src/lib/store/store";
import type { FatimaConfig } from "src/core/config";

export const reloadEnv = async (config: FatimaConfig) => {
	const { env, envCount } = await loadEnv(config);

	logger.success(`Reloaded ${envCount} environment variables`);

	if (!fatimaStore.get("fatimaLiteMode")) {
		createClient(config, env);
	}

	if (config.validate) {
		const { errors } = await config.validate(env);

		if (errors?.length) {
			const parsedErrors = parseValidationErrors(errors);

			lifecycle.error.invalidEnvironmentVariables(parsedErrors, false);
		}
	}

	return { env, envCount };
};
