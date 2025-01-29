import { UnsafeEnvironmentVariables } from "src/core/types";
import { DotsafeConfig } from "../../core/config";
import { logger } from "./logger";

export async function getEnv(config: DotsafeConfig) {
  try {
    const env =
      (await config.load({
        processEnv: process.env as UnsafeEnvironmentVariables,
      })) ?? {};

    return {
      env,
      envCount: Object.keys(env).length,
    };
  } catch (err: any) {
    logger.error(`Failed to reload environment variables: ${err.message}`);
    process.exit(1);
  }
}
