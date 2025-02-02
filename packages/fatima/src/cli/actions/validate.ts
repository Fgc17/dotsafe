import { transpileConfig } from "../utils/transpile-config";
import { logger } from "../../core/utils/logger";
import { loadEnv } from "../utils/load-env";

export const validateAction = async (options: { config?: string }) => {
  if (!process.env.NODE_ENV) {
    logger.warn(
      `No NODE_ENV found, I will use "development" as the default environment. Consider setting the NODE_ENV environment variable.`
    );
  }

  const config = await transpileConfig(options?.config);

  const { env } = await loadEnv(config);

  const validate = config.validate;

  if (!validate) {
    logger.error(
      `Validate command was called but no validator was provided in the config.`
    );
    process.exit(1);
  }

  const { isValid, errors } = await validate(env, {
    configPath: config.file.path,
  });

  if (!isValid && errors) {
    const groupedErrors = errors.reduce(
      (acc, error) => {
        const key = error.key;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(error.message);

        return acc;
      },
      {} as Record<string, string[]>
    );

    logger.error(
      `Validation failed, here's the error list:` +
        "\n\n" +
        Object.entries(groupedErrors)
          ?.map(
            ([key, messages]) => `❌ ${key}\n  • ${messages.join("\n  • ")}`
          )
          .join("\n")
    );

    process.exit(1);
  }

  logger.success(`Successfully validated environment variables`);
};
