import { reloadEnv } from "src/cli/utils/reload-env";
import type { FatimaConfig } from "src/core/config";
import type { UnsafeEnvironmentVariables } from "src/core/types";
import { logger } from "../logger/logger";
import type { Promisable } from "../types";
import http from "node:http";
import { lifecycle } from "src/core/lifecycle";

export function listenRemoteEnv(
	config: FatimaConfig,
	callback?: (env: UnsafeEnvironmentVariables) => Promisable<void>,
) {
	const port = config.ports.reload;

	if (!port) return;

	const server = http.createServer(async (req, res) => {
		if (req.url === "/fatima" && req.method === "POST") {
			const { env } = await reloadEnv(config);

			await callback?.(env);

			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ status: "success" }));
		} else {
			res.writeHead(404, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ status: "not found" }));
		}
	});

	server.listen(port, () => {
		logger.success(
			`Webhook listening on port ${port} for POST /fatima requests.`,
		);
	});

	server.on("error", (error) => {
		if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
			lifecycle.error.reloadingPortAlreadyInUse(port);
		}
	});

	return server;
}
