import { UnsafeEnvironmentVariables } from "src/dotsafe/types";
import { DotsafeConfig } from "../../dotsafe/config";
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
