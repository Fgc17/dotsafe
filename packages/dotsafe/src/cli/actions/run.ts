import { spawn } from "child_process";
import { logger } from "../utils/logger";
import { getConfig } from "../utils/get-config";
import { getEnv } from "../utils/get-env";
import { populateProcessEnv } from "../utils/assign-env";

export async function runAction(
  options: { config: string; generate: boolean },
  args: string[]
) {
  const config = await getConfig(options.config);

  const { env, envCount } = await getEnv(config);

  logger.success(`Loaded ${envCount} environment variables`);

  populateProcessEnv(env);

  const cmd = args.shift();

  const child = spawn(cmd!, [...args], {
    env: process.env,
    shell: true,
    stdio: "inherit",
  });

  child.on("error", (error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`Command exited with code ${code}`);
      process.exit(code!);
    }
  });
}
