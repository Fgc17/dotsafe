import { resolve } from "path";
import { createJiti } from "jiti";
import { DotsafeConfig } from "src/core/config";
import { logger } from "./logger";

const jiti = createJiti(import.meta.url);

export async function getConfig(configPath?: string) {
  const path = resolve(process.cwd(), configPath ?? "env.config.ts");

  try {
    const config = (await jiti.import(path, {
      default: true,
    })) satisfies DotsafeConfig;

    if (!config.__fatimaconfig) {
      logger.error(
        "Config file must be created with the env.ts config function."
      );
      process.exit(1);
    }

    return {
      ...config,
      path,
    };
  } catch (error: any) {
    console.log(error);
    logger.error("Failed to read config file, check if it exists.");
    process.exit(1);
  }
}
