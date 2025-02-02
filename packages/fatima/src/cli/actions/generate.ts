import { transpileConfig } from "../utils/transpile-config";
import { loadEnv } from "../utils/load-env";
import { logger } from "../../core/utils/logger";
import { createClient } from "../utils/create-client";

export const generateAction = async (options: { config?: string }) => {
  if (!process.env.NODE_ENV) {
    logger.warn(
      `No NODE_ENV found, I will use "development" as the default environment. Consider setting the NODE_ENV environment variable.`
    );
  }

  const config = await transpileConfig(options?.config);

  const { env, envCount } = await loadEnv(config);

  createClient(config, env);

  logger.success(
    `Successfully generated env.ts with ${envCount} environment variables`
  );
};
