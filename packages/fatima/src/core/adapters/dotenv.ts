import type {
	FatimaBuiltInLoadFunction,
	UnsafeEnvironmentVariables,
} from "../types";
import type { AnyType } from "../utils/types";

export type DotenvConfigOptionsMock = {
	path: string | string[] | URL;
};

export interface DotenvMock {
	config: (config?: DotenvConfigOptionsMock) => {
		parsed?: AnyType;
	};
}

const load =
	(
		dotenv: DotenvMock,
		config?: DotenvConfigOptionsMock,
	): FatimaBuiltInLoadFunction =>
	async () => {
		const env = (dotenv.config(config).parsed ??
			{}) as UnsafeEnvironmentVariables;

		return env;
	};

export const dotenv = {
	load,
};
