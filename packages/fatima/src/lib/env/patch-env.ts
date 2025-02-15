import type { UnsafeEnvironmentVariables } from "src/core/types";
import { fatimaStore } from "../store/store";
import net from "node:net";

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

export function updateChildEnv(env: UnsafeEnvironmentVariables) {
	const instrumentationPort = fatimaStore.get("fatimaInstrumentationPort");

	if (!instrumentationPort) return;

	try {
		const client = net.createConnection({
			port: Number(instrumentationPort),
		});

		client.write(
			JSON.stringify({
				type: "update-env",
				env,
			}),
		);
	} catch {}
}
