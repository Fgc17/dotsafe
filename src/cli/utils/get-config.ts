import { TSEnvConfig } from "src/tsenv/config";
import { createJiti } from "jiti";
import { logger } from "./logger";
import { resolve } from "path";

const jiti = createJiti(import.meta.url);

export async function getConfig(path?: string) {
  const configPath = resolve(process.cwd(), path ?? "env.config.ts");

  try {
    const config = (await jiti.import(configPath, {
      default: true,
    })) satisfies TSEnvConfig;

    return config as TSEnvConfig;
  } catch (error: any) {
    logger.error(error, "Failed to read config file, check if it exists.");
    return process.exit(0);
  }
}
