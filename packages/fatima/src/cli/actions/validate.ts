import { transpileConfig } from "../utils/transpile-config";
import { logger } from "../../core/utils/logger";
import { loadEnv } from "../utils/load-env";
import { parseValidationErrors } from "../utils/parse-errors";
import { lifecycle } from "src/core/lifecycle";

export const validateAction = async (options: { config?: string }) => {
	const config = await transpileConfig(options?.config);

	const { env } = await loadEnv(config);

	const validate = config.validate;

	if (!validate) {
		logger.error(
			"Validate command was called but no validator was provided in the config.",
		);
		process.exit(1);
	}

	const { isValid, errors } = await validate(env, {
		configPath: config.file.path,
	});

	if (!isValid && errors) {
		const parsedErrors = parseValidationErrors(errors);

		return lifecycle.error.invalidEnvironmentVariables(parsedErrors);
	}

	logger.success("Successfully validated environment variables");
};
