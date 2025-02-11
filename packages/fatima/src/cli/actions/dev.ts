import { type ChildProcess, spawn } from "node:child_process";
import { logger } from "../../core/utils/logger";
import { transpileConfig } from "../utils/transpile-config";
import { loadEnv } from "../utils/load-env";
import type { UnsafeEnvironmentVariables } from "src/core/types";
import { debounce } from "../utils/debounce";
import { createClient } from "../utils/create-client";
import { createInjectableEnv } from "../utils/env-patch";

import fs from "node:fs";
import http from "node:http";
import { fatimaEnv } from "src/core/utils/fatima-env";
import { parseValidationErrors } from "../utils/parse-errors";
import { lifecycle } from "src/core/lifecycle";

type ActionOptions = {
	config: string;
	generate: boolean;
	lite: boolean;
};

const environmentBlacklist = [
	"production",
	"prod",
	"staging",
	"stg",
	"preview",
	"pre",
	"prev",
	"preprod",
];

export const devAction = async (options: ActionOptions, args: string[]) => {
	const config = await transpileConfig(options.config);

	const environment = fatimaEnv.get();

	if (environmentBlacklist.includes(environment)) {
		logger.error(
			`Your 'config.environment()' function returned '${environment}', you can't run 'fatima dev' in this environment.`,
		);
		process.exit(1);
	}

	const { env, envCount } = await loadEnv(config);

	if (!options.lite) {
		createClient(config, env);
	}

	logger.success(`Loaded ${envCount} environment variables`);

	const injectableEnv = createInjectableEnv(env);

	const cmd = args.shift();

	const child = spawn(cmd as string, [...args], {
		env: injectableEnv,
		shell: true,
		stdio: ["inherit", "inherit", "inherit", "ipc"],
	});

	const envFilesDir = config.file.folderPath;

	const updateChildEnv = (
		child: ChildProcess,
		env: UnsafeEnvironmentVariables,
	) => {
		child.send({ type: "update-env", env });
	};

	const reloadEnvironments = async () => {
		const { env, envCount } = await loadEnv(config);

		const injectableEnv = createInjectableEnv(env);

		updateChildEnv(child, injectableEnv);

		logger.success(`Reloaded ${envCount} environment variables`);

		if (!options.lite) {
			createClient(config, env);
		}

		if (config.validate) {
			const { errors } = await config.validate(env, {
				configPath: config.file.path,
			});

			if (errors?.length) {
				const parsedErrors = parseValidationErrors(errors);

				lifecycle.error.invalidEnvironmentVariables(parsedErrors, false);
			}
		}
	};

	const watcher = fs.watch(
		envFilesDir,
		debounce(async (_, filename: string | null) => {
			if (
				!filename ||
				!filename.endsWith(".env") ||
				filename.startsWith(".tmp") ||
				filename === ".example.env"
			)
				return;

			await reloadEnvironments();
		}, 100),
	);

	if (config.hook?.port) {
		const server = http.createServer((req, res) => {
			if (req.url !== "/fatima") {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ status: "not found" }));
				return;
			}

			let body = "";

			req.on("data", (chunk) => {
				body += chunk;
			});

			req.on("end", async () => {
				try {
					await reloadEnvironments();

					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ status: "success" }));
				} catch (error) {
					logger.error("Error processing webhook:", error.message);

					res.writeHead(400, { "Content-Type": "application/json" });

					res.end(JSON.stringify({ status: "error", message: error.message }));
				}
			});

			req.on("error", (err) => {
				logger.error("Request error:", err.message);

				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(
					JSON.stringify({
						status: "error",
						message: "Internal Server Error",
					}),
				);
			});
		});

		const PORT = config.hook.port;

		server.listen(PORT, () => {
			logger.success(
				`Development webhook is listening on port ${PORT} for POST /fatima requests.`,
			);
		});
	}

	child.on(
		"message",
		(message: { type: string; env: UnsafeEnvironmentVariables }) => {
			if (message.type === "update-env") {
				const injectableEnv = createInjectableEnv(message.env);

				Object.assign(process.env, injectableEnv);
			}
		},
	);

	child.on("error", (error) => {
		console.error(`Error: ${error.message}`);
		watcher.close();
		process.exit(1);
	});

	child.on("close", (code) => {
		if (code !== 0) {
			console.error(`Command exited with code ${code}`);
			watcher.close();
			process.exit(code);
		}
	});
};
