import { FatimaLoadFunction, UnsafeEnvironmentVariables } from "../types";

export type DotenvConfigOptionsMock = {
	path: string | string[] | URL;
};

export interface DotenvMock {
	config: (config?: DotenvConfigOptionsMock) => {
		parsed?: any;
	};
}

const load =
	(dotenv: DotenvMock, config?: DotenvConfigOptionsMock): FatimaLoadFunction =>
	async () => {
		const env = (dotenv.config(config).parsed ??
			{}) as UnsafeEnvironmentVariables;

		return env;
	};

export const dotenv = {
	load,
};
