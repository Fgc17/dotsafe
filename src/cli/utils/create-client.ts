import { writeFileSync } from "fs";
import path from "path";
import { DotsafeConfig } from "src/dotsafe/config";
import { getClientContent } from "./get-client-content";
import { UnsafeEnvironmentVariables } from "src/dotsafe/types";

export function createClient(
  config: DotsafeConfig,
  env: UnsafeEnvironmentVariables
) {
  let clientPath = path.resolve(config.location.folderPath, config.output);

  let envs = Object.keys(env ?? {});

  let client = getClientContent(envs, config.client);

  writeFileSync(clientPath, client);
}
