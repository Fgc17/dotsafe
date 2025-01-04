import { spawn } from "child_process";
import { logger } from "../utils/logger";
import { ActionArgs } from "../utils/get-action-args";

export async function runAction({ config }: ActionArgs, args: string[]) {
  const env = (await config.loader()) ?? {};

  const envCount = Object.keys(env).length;

  logger.success(`Loaded ${envCount} environment variables`);

  Object.assign(env, process.env, { FORCE_COLOR: "1" });

  const cmd = args.shift();
  const child = spawn(cmd!, [...args, "--color=always"], {
    env,
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
