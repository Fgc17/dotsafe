import path from "path";
import { writeFileSync } from "fs";
import { getConfig } from "../utils/get-config";
import { getEnv } from "../utils/get-env";
import { logger } from "../utils/logger";
import { createClient } from "../utils/create-client";

export async function generateAction(options?: { config?: string }) {
  const config = await getConfig(options?.config);

  const env = await getEnv(config);

  let clientPath = path.resolve(config.location.folderPath, config.output);

  let envs = Object.keys(env);

  let client = createClient(envs, config.client);

  logger.success(
    `Successfully generated env.ts with ${envs.length} environment variables`
  );

  writeFileSync(clientPath, client);
}
