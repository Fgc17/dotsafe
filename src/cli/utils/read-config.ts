import { TSEnvConfig } from "src/config";
import { createJiti } from "jiti";
import { logger } from "./logger";

const jiti = createJiti(import.meta.url);

export async function readConfig(path: string) {
  try {
    const config = (await jiti.import(path, {
      default: true,
    })) satisfies TSEnvConfig;

    return config as TSEnvConfig;
  } catch (error: any) {
    logger.error(error, "Failed to read config file, check if it exists.");
    return process.exit(0);
  }
}
