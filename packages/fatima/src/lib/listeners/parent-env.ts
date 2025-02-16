import { populateEnv } from "../env/patch-env";
import { logger } from "../logger/logger";
import { lifecycle } from "src/core/lifecycle";

export async function listenParentEnv(port: number) {
	const net = await import("node:net");

	const tcpServer = net.createServer((socket) => {
		socket.on("data", (data) => {
			try {
				const message = JSON.parse(data.toString());
				if (message.type === "update-env") {
					populateEnv(message.env);
					logger.success("Successfully reloaded 'process.env'");
				}
			} catch {}
		});
	});

	tcpServer.listen(port);

	tcpServer.on("error", (error) => {
		if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
			lifecycle.error.instrumentationPortAlreadyInUse(port);
		}
	});
}
