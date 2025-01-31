import { spawn } from "child_process";
import { promises as fs } from "fs";
import { FatimaLoadFunction, UnsafeEnvironmentVariables } from "../types";
import { logger } from "../utils/logger";

export interface VercelLoadArgs {
  /**
   * Bring your own parser here, it should take a string (env file content) and return an object with the environment variables.
   * You can use `dotenv.parse` from the `dotenv` package, but you know best.
   */
  parser: (envFileContent: string) => UnsafeEnvironmentVariables;

  /**
   * The environment to pull the variables from.
   *
   * @default "development"
   */
  projectEnv?: string;
}

const load =
  ({
    parser,
    projectEnv = "development",
  }: VercelLoadArgs): FatimaLoadFunction =>
  async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        const child = spawn("vercel", [
          "env",
          "pull",
          ".tmp.vercel.env",
          `--environment=${projectEnv}`,
        ]);

        child.on("error", (e) => {
          reject(e);
        });

        child.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });

      const envFileContent = await fs.readFile(".tmp.vercel.env", "utf-8");

      const envVariables = parser(envFileContent);

      await fs.unlink(".tmp.vercel.env");

      return envVariables;
    } catch (error) {
      logger.error(
        "'vercel pull env' didn't work, here are some possible reasons:\n",
        "1. You didn't install the Vercel CLI: `npm i -g vercel`",
        "2. You are not logged: `vercel login`",
        "3. You didn't link your codebase to a Vercel project: `vercel link`",
        "4. You somehow do not have the `development` environment, in this case you can use `adapters.vercel.load({ environment })`"
      );
      process.exit(1);
    }
  };

export const vercel = {
  load,
};
