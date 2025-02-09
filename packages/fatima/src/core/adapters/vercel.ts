import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import type { FatimaLoadFunction, UnsafeEnvironmentVariables } from "../types";
import { logger } from "../utils/logger";

export type VercelParseFunction = (
	envFileContent: string,
) => UnsafeEnvironmentVariables;

export interface VercelLoadConfig {
	/**
	 * The environment to pull the variables from.
	 *
	 * @default "development"
	 */
	projectEnv?: string;
}

const load =
	(parse: VercelParseFunction, config?: VercelLoadConfig): FatimaLoadFunction =>
	async () => {
		try {
			await new Promise<void>((resolve, reject) => {
				const child = spawn("vercel", [
					"env",
					"pull",
					".tmp.vercel.env",
					`--environment=${config?.projectEnv ?? "development"}`,
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

			const envVariables = parse(envFileContent);

			await fs.unlink(".tmp.vercel.env");

			return envVariables;
		} catch (error) {
			logger.error(
				"'vercel pull env' didn't work, here are some possible reasons:\n",
				"1. You didn't install the Vercel CLI: `npm i -g vercel`",
				"2. You are not logged: `vercel login`",
				"3. You didn't link your codebase to a Vercel project: `vercel link`",
				"4. You somehow do not have the `development` environment, in this case you can use `adapters.vercel.load({ environment })`",
			);
			process.exit(1);
		}
	};

export const vercel = {
	load,
};
