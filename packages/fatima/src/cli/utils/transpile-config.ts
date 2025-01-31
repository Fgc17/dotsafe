import { createJiti, Jiti, JitiOptions } from "jiti";
import { FatimaConfig } from "src/core/config";
import { logger } from "../../core/utils/logger";
import pluginTransformClassProperties from "@babel/plugin-transform-class-properties";
import { resolveConfigPath } from "./resolve-config-path";

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

    if (!config.__fatimaconfig) {
      logger.error(
        "Config file must be created with the env.ts config function."
      );
      process.exit(1);
    }

    process.env = originalEnv;

    return config;
  } catch (error: any) {
    logger.error(error.message);
    logger.error("Failed to read config file, check if it exists.");
    process.exit(1);
  }
}
