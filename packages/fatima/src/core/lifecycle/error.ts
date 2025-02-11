import type { FatimaParsedValidationErrors } from "../types";
import { logger } from "../utils/logger";

const missingEnvironmentVariable = (env: string): never => {
	logger.error(`Missing environment variable: ${env}`);

	process.exit(1);
};

const missingConfig = (config: string): never => {
	logger.error(`Missing configuration: ${config}`);

	process.exit(1);
};

const missingEnvironmentConfig = () => {
	logger.error(
		`No 'config.environment' found. Please set the environment config in your fatima.config.ts file.`,
	);

	process.exit(1);
};

const undefinedEnvironmentFunctionReturn = () => {
	logger.error(
		`The 'config.environment' function returned undefined or "". Please return a filled string.`,
	);

	process.exit(1);
};

const environmentMixing = (initial: string, final: string) => {
	logger.error(
		`You tried to load "${initial}" variables, but ended up loading "${final}" variables, be careful.\n`,
		"The environment must be consistent, otherwise you risk loading secrets from the wrong environment (e.g prod -> dev).",
	);

	process.exit(1);
};

const invalidEnvironmentVariables = (
	parsedErrors: FatimaParsedValidationErrors,
	exit = true,
) => {
	logger.error(
		"Validation failed, here's the error list:" +
			"\n\n" +
			Object.entries(parsedErrors)
				?.map(([key, messages]) => `❌ ${key}\n  • ${messages.join("\n  • ")}`)
				.join("\n"),
	);

	if (exit) {
		process.exit(1);
	}
};

export const error = {
	missingConfig,
	missingEnvironmentConfig,
	missingEnvironmentVariable,
	undefinedEnvironmentFunctionReturn,
	environmentMixing,
	invalidEnvironmentVariables,
};
