import { spawn } from "node:child_process";
import { logger } from "../../core/utils/logger";
import type { UnsafeEnvironmentVariables } from "src/core/types";
import { debounce } from "../utils/debounce";
import { createClient } from "../utils/create-client";
import { createInjectableEnv } from "../utils/env-patch";
import fs from "node:fs";
import http from "node:http";
import { fatimaStore } from "src/core/utils/store";
import { reloadEnv } from "../utils/reload-env";
import { createAction, type ActionContext } from "../utils/create-action";

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

export const devService = async ({
	config,
	options,
	env,
	envCount,
	args,
}: ActionContext) => {
	const environment = fatimaStore.get("fatimaEnvironment");

	if (environmentBlacklist.includes(environment)) {
		logger.error(
			`Your 'config.environment()' function returned '${environment}', you can't run 'fatima dev' in this environment.`,
		);
		process.exit(1);
	}

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

			await reloadEnv({
				config,
				options,
				process: child,
			});
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
					await reloadEnv({
						process: child,
						config,
						options,
					});

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

export const devAction = createAction(devService);
