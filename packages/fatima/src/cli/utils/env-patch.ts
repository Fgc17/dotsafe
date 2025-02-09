import type { UnsafeEnvironmentVariables } from "src/core/types";

export function createInjectableEnv(env?: UnsafeEnvironmentVariables) {
	return {
		...process.env,
		...env,
	} as UnsafeEnvironmentVariables;
}

export function initializeEnv(env: UnsafeEnvironmentVariables = {}) {
	process.env = {
		...process.env,
		...env,
		FORCE_COLOR: "1",
		TS_ENV: "1",
	};
}
