import { resolve } from "path";
import { createJiti } from "jiti";
import { DotsafeConfig } from "src/dotsafe/config";
import { logger } from "./logger";

const jiti = createJiti(import.meta.url);

export async function getConfig(path?: string) {
  const configPath = resolve(process.cwd(), path ?? "env.config.ts");

  try {
    const config = (await jiti.import(configPath, {
      default: true,
    })) satisfies DotsafeConfig;

    return config as DotsafeConfig;
  } catch (error: any) {
    console.log(error);
    logger.error("Failed to read config file, check if it exists.");
    return process.exit(1);
  }
}
