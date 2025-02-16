import type { UnsafeEnvironmentVariables } from "src/core/types";
import { fatimaStore } from "../store/store";
import { debug } from "../logger/debugger";

export function createInjectableEnv(env?: UnsafeEnvironmentVariables) {
	return {
		...process.env,
		...env,
	} as UnsafeEnvironmentVariables;
}

export function populateEnv(env: UnsafeEnvironmentVariables = {}) {
	Object.assign(process.env, env);
}

export function initializeEnv(env: UnsafeEnvironmentVariables = {}) {
	process.env = {
		...process.env,
		...env,
		FORCE_COLOR: "1",
	};
}

export async function updateChildEnv(env: UnsafeEnvironmentVariables) {
	const instrumentationPort = fatimaStore.get("fatimaInstrumentationPort");

	if (!instrumentationPort) return;

	try {
		const net = await import("node:net");

		const client = net
			.createConnection({
				port: Number(instrumentationPort),
			})
			.on("error", debug.error);

		client.write(
			JSON.stringify({
				type: "update-env",
				env,
			}),
		);
	} catch {}
}
