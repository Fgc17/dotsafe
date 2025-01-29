import { getConfig } from "../utils/get-config";
import { getEnv } from "../utils/get-env";
import { logger } from "../utils/logger";
import { createClient } from "../utils/create-client";

export async function generateAction(options?: { config?: string }) {
  const config = await getConfig(options?.config);

  const { env, envCount } = await getEnv(config);

  createClient(config, env);

  logger.success(
    `Successfully generated env.ts with ${envCount} environment variables`
  );
}
