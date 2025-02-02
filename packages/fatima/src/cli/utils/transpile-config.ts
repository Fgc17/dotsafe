import { createJiti, Jiti, JitiOptions } from "jiti";
import { FatimaConfig } from "src/core/config";
import { logger } from "../../core/utils/logger";
import pluginTransformClassProperties from "@babel/plugin-transform-class-properties";
import { resolveConfigPath } from "./resolve-config-path";
import { fatimaEnv } from "src/core/utils/fatima-env";
import { UnsafeEnvironmentVariables } from "src/core/types";

export async function transpileConfig(
  configPath?: string
): Promise<FatimaConfig> {
  const originalEnv = { ...process.env };

  const path = resolveConfigPath(configPath);

  let jiti: Jiti;

  const jitiOptions: JitiOptions = {
    interopDefault: true,
    fsCache: false,
    transformOptions: {
      ts: true,
      babel: {
        plugins: [pluginTransformClassProperties],
      },
    },
  };

  try {
    jiti = createJiti(import.meta.url, {
      ...jitiOptions,
      tryNative: true,
    });
  } catch {
    jiti = createJiti(import.meta.url, jitiOptions);
  }

  try {
    const config = (await jiti.import(path, {
      default: true,
    })) satisfies FatimaConfig;

    process.env = originalEnv;

    fatimaEnv.set(
      config.environment(process.env as UnsafeEnvironmentVariables)
    );

    if (!config.__fatimaconfig) {
      logger.error(
        "Config file must be created with the fatima config function."
      );
      process.exit(1);
    }

    return config;
  } catch (error: any) {
    logger.error(error.message);
    logger.error("Failed to read config file, check if it exists.");
    process.exit(1);
  }
}
