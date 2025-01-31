import { FatimaLoadFunction, UnsafeEnvironmentVariables } from "src/core/types";
import { FatimaConfig } from "../../core/config";
import { logger } from "../../core/utils/logger";

export async function loadEnv(config: FatimaConfig) {
  try {
    const initialNodeEnv = process.env.NODE_ENV!;

    const load = config.load[initialNodeEnv];

    if (!load) {
      logger.info(
        `No loader function found for "NODE_ENV=${initialNodeEnv}", I will load the process.env object (this is expected for production environments).`
      );

      return {
        env: process.env as UnsafeEnvironmentVariables,
        envCount: Object.keys(process.env).length,
      };
    }

    let loadChain = load as FatimaLoadFunction[];

    if (!load.length) {
      const loadFunction = load as FatimaLoadFunction;

      loadChain = [loadFunction];
    }

    let env = {} as UnsafeEnvironmentVariables;

    for (const load of loadChain) {
      const loadedEnvs = await load();

      process.env = { ...process.env, ...loadedEnvs };

      env = { ...env, ...loadedEnvs };
    }

    if (env.NODE_ENV !== initialNodeEnv) {
      logger.error(
        `You tried to load the environments with NODE_ENV=${initialNodeEnv}, but loaded NODE_ENV=${env.NODE_ENV}.\n`,
        "The NODE_ENV must be consistent, otherwise you risk loading secrets from the wrong environment (e.g prod -> dev)."
      );
      process.exit(1);
    }

    return {
      env,
      envCount: Object.keys(env).length,
    };
  } catch (err: any) {
    logger.error(`Failed to load environment variables: ${err.message}`);
    process.exit(1);
  }
}
