import type { FatimaConfig } from "src/core/config";
import type { UnsafeEnvironmentVariables } from "src/core/types";

type FatimaStore = {
	fatimaEnvironment: string;
	fatimaConfigPath: string;
	fatimaLogs: string;
	fatimaTransformedConfigPath: string;
	fatimaInstrumentationPort: string;
	fatimaStoreMarker: string;
	fatimaEnvNames: string;
	fatimaLiteMode: string | undefined;
	fatimaDebug: string | undefined;
	fatimaDevMode: string | undefined;
};

export const fatimaStore = {
	get<K extends keyof FatimaStore>(key: K) {
		return process.env[key] as FatimaStore[K];
	},
	set(key: keyof FatimaStore, value?: string) {
		process.env[key] = value?.toLowerCase().trim();
	},
	exists() {
		return process.env.fatimaStoreMarker === "true";
	},
};

export const initializeStore = (
	config: FatimaConfig,
	options: Record<string, string>,
) => {
	fatimaStore.set("fatimaEnvNames", "");

	fatimaStore.set("fatimaStoreMarker", "true");

	fatimaStore.set(
		"fatimaEnvironment",
		config.environment(process.env as UnsafeEnvironmentVariables),
	);

	fatimaStore.set("fatimaConfigPath", config.file.path);

	fatimaStore.set(
		"fatimaInstrumentationPort",
		String(config.ports?.instrumentation ?? "12485"),
	);

	fatimaStore.set("fatimaLiteMode", options.lite);

	fatimaStore.set("fatimaDebug", options.debug);
};
