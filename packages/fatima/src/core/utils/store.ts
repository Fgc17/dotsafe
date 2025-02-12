type FatimaEnvKeys =
	| "fatimaEnvironment"
	| "fatimaConfigPath"
	| "fatimaTransformedConfigPath"
	| "fatimaLogs";

export const fatimaStore = {
	get(key: FatimaEnvKeys) {
		return process.env[key] as string;
	},
	set(key: FatimaEnvKeys, value?: string) {
		process.env[key] = value?.toLocaleLowerCase();
	},
};
