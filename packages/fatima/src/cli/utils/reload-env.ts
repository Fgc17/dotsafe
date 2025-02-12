import { lifecycle } from "src/core/lifecycle";
import { logger } from "src/core/utils/logger";
import { createClient } from "./create-client";
import { createInjectableEnv } from "./env-patch";
import { loadEnv } from "./load-env";
import { parseValidationErrors } from "./parse-errors";
import type { FatimaConfig } from "src/core/config";
import type { ChildProcess } from "node:child_process";

export const reloadEnv = async ({
	process,
	config,
	options,
}: {
	process: ChildProcess;
	config: FatimaConfig;
	options: Record<string, string>;
}) => {
	const { env, envCount } = await loadEnv(config);

	process.send({ type: "update-env", env });

	logger.success(`Reloaded ${envCount} environment variables`);

	if (!options.lite) {
		createClient(config, env);
	}

	if (config.validate) {
		const { errors } = await config.validate(env);

		if (errors?.length) {
			const parsedErrors = parseValidationErrors(errors);

			lifecycle.error.invalidEnvironmentVariables(parsedErrors, false);
		}
	}
};
