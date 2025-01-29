import { spawn } from "child_process";
import { promises as fs } from "fs";
import { UnsafeEnvironmentVariables } from "../types";

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

const load = async ({ parser, projectEnv = "development" }: VercelLoadArgs) => {
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("vercel", [
        "env",
        "pull",
        ".tmp.vercel.env",
        `--environment=${projectEnv}`,
      ]);

      child.on("error", (e) => {
        console.log(e);
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
    console.log(
      "\x1b[41m",
      "🔒 [fatima] 'vercel pull env' didn't work, here are some possible reasons:",
      "\n 1. You didn't install the Vercel CLI: `npm i -g vercel`",
      "\n 2. You are not logged: `vercel login`",
      "\n 3. You didn't link your codebase to a Vercel project: `vercel link`",
      "\n 4. You somehow do not have the `development` environment, in this case you can use `adapters.vercel.load({ environment })`",
      "\x1b[0m"
    );
    process.exit(1);
  }
};

export const vercel = {
  load,
};
