import path from "node:path";
import type {
	FatimaClientOptions,
	FatimaEnvironment,
	FatimaEnvironmentFunction,
	FatimaLoadObject,
	FatimaPortOptions,
	FatimaValidator,
} from "./types";
import { getCallerLocation } from "src/lib/utils/get-caller-location";
import { lifecycle } from "./lifecycle";

export type FatimaOptions<
	Environments extends FatimaEnvironment = FatimaEnvironment,
> = {
	/**
	 * Anything you return here will become your environment variables
	 */
	load: FatimaLoadObject<Environments>;
	/**
	 * The environment to pull the variables from, will be used in the load object.
	 */
	environment: FatimaEnvironmentFunction;
	/**
	 * Environment options
	 */
	client?: FatimaClientOptions;
	/**
	 * Function that will validate the environment variables
	 */
	validate?: FatimaValidator;
	/**
	 * Port options
	 */
	ports?: FatimaPortOptions;
};

export type FatimaConfig = ReturnType<typeof config>;

export function config<Environments extends FatimaEnvironment>({
	load,
	environment,
	validate,
	client,
	ports,
}: FatimaOptions<Environments>) {
	if (!environment) {
		return lifecycle.error.missingEnvironmentConfig();
	}

	const { filePath: configFilePath, folderPath: configFolderPath } =
		getCallerLocation();

	const configExtension = path.extname(configFilePath);

	const defaultPortOptions: FatimaPortOptions = {
		instrumentation: 15781,
	};

	return markConfig({
		validate,
		environment,
		client,
		load,
		ports: {
			...defaultPortOptions,
			...ports,
		},
		file: {
			extension: configExtension,
			path: configFilePath,
			folderPath: configFolderPath,
		},
	});
}

export const markConfig = <T>(config: T) => {
	return {
		...config,
		fatimaConfigMarker: true,
	};
};

export const isFatimaConfig = (
	config: FatimaConfig,
): config is FatimaConfig => {
	return config.fatimaConfigMarker ?? false;
};
