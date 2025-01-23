import dotenv from "dotenv";
import { spawn } from "child_process";
import { promises as fs } from "fs";

const loader = async (environment: string = "development") => {
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("vercel", [
        "env",
        "pull",
        ".tmp.vercel.env",
        `--environment=${environment}`,
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

    const envVariables = dotenv.parse(envFileContent);

    await fs.unlink(".tmp.vercel.env");

    return envVariables;
  } catch (error) {
    console.log(
      "\x1b[41m",
      "🔒 [dotsafe] 'vercel pull env' didn't work, here are some possible reasons:",
      "\n 1. You didn't install the Vercel CLI: `npm i -g vercel`",
      "\n 2. You are not logged: `vercel login`",
      "\n 3. You didn't link your codebase to a Vercel project: `vercel link`",
      "\n 3. You do not have the `development` environment, in this case you can use `dotsafe.adapters.vercel.loader(<your-environment>)`",
      "\x1b[0m"
    );
    process.exit(0);
  }
};

export const vercel = {
  loader,
};
