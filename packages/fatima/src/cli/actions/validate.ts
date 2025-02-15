import { logger } from "src/lib/logger/logger";
import { parseValidationErrors } from "src/lib/utils/parse-validation";
import { createAction, type ActionContext } from "../utils/create-action";
import { lifecycle } from "src/core/lifecycle";

export const validateService = async ({
	env,
	config: { validate },
}: ActionContext) => {
	if (!validate) {
		logger.error(
			"Validate command was called but no validator was provided in the config.",
		);
		process.exit(1);
	}

	const { isValid, errors } = await validate(env);

	if (!isValid && errors) {
		const parsedErrors = parseValidationErrors(errors);

		return lifecycle.error.invalidEnvironmentVariables(parsedErrors);
	}

	logger.success("Successfully validated environment variables");
};

export const validateAction = createAction(validateService);
