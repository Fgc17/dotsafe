import { config as loadEnv, parse } from "dotenv";
import { DotsafeConfig } from "../../dotsafe/config";

export async function getEnv(config: DotsafeConfig) {
  const processEnv = loadEnv().parsed ?? {};

  const env = (await config.loader({ parse, processEnv })) ?? {};

  return env;
}
