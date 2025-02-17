import type { AnyType, Promisable } from "src/lib/types";
import { transpileConfig } from "./transpile-config";
import { loadEnv } from "src/lib/env/load-env";
import type { FatimaConfig } from "src/core/config";
import type { UnsafeEnvironmentVariables } from "src/core/types";
import { initializeStore } from "src/lib/store/store";

export interface ActionContext {
	config: FatimaConfig;
	env: UnsafeEnvironmentVariables;
	envCount: number;
	args: string[];
	options: Record<string, string>;
}

export const createAction = (
	action: (ctx: ActionContext) => Promisable<void>,
) => {
	return async (param1: AnyType, param2: AnyType) => {
		const isParam1Array = Array.isArray(param1);

		const args = isParam1Array ? param1 : param2;

		const options = isParam1Array ? param2 : param1;

		const configPath = options.config;

		const config = await transpileConfig(configPath);

		initializeStore(config, options);

		const { env, envCount } = await loadEnv(config);

		await action({ config, env, envCount, args, options });

		if (!process.env.npm_package_version) {
			console.log("");
		}
	};
};
