import { getConfig } from "../utils/get-config";
import { logger } from "../utils/logger";
import { getEnv } from "../utils/get-env";

export async function validateAction(options?: { config?: string }) {
  const config = await getConfig(options?.config);

  const env = await getEnv(config);

  const validator = config.validate;

  if (!validator) {
    logger.error(
      `Validate command was called but no validator was provided in the config.`
    );
    process.exit(0);
  }

  const { isValid, errors } = await validator(env);

  if (!isValid) {
    logger.error(
      `Validation failed, here's the error list:` +
        "\n\n" +
        errors?.map((error) => `❌ ${error.key}: ${error.message}`).join("\n")
    );

    process.exit(1);
  }

  logger.success(`Successfully validated environment variables`);
}
