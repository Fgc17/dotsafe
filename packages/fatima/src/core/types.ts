import type { Promisable } from "src/lib/types";

export type UnsafeEnvironmentVariables = Record<string, string>;

export type FatimaEnvironment = string;

export type FatimaBuiltInLoadFunction =
	() => Promisable<UnsafeEnvironmentVariables>;

export type FatimaCustomLoadFunction = (
	processEnv: UnsafeEnvironmentVariables,
) => Promisable<UnsafeEnvironmentVariables>;

export type FatimaLoadFunction =
	| FatimaBuiltInLoadFunction
	| FatimaCustomLoadFunction;

export type FatimaLoaderChain = FatimaLoadFunction[] | FatimaLoadFunction;

export type FatimaLoadObject<Environments extends FatimaEnvironment> = {
	[env in Environments]?: FatimaLoaderChain;
};

export type FatimaValidatorError = {
	key: string;
	message: string;
};

export type FatimaValidationResult = {
	isValid: boolean;
	errors: FatimaValidatorError[];
};

export type FatimaValidator = (
	env: UnsafeEnvironmentVariables,
) => Promisable<FatimaValidationResult>;

export type FatimaParsedValidationErrors = Record<string, string[]>;

export type FatimaEnvironmentFunction = (
	processEnv: UnsafeEnvironmentVariables,
) => string;

export interface FatimaClientOptions {
	/**
	 * Prefix for the client
	 */
	publicPrefix?: string;
	/**
	 * Function to verify server environment
	 */
	isServer?: () => boolean;
}

export interface FatimaPortOptions {
	/**
	 * @description This is a port number.
	 * @default 12485
	 *
	 * It will power the 'instrumentation.watch()' method, allowing secret reloading inside your application.
	 */
	instrumentation?: number;
	/**
	 * @description This is a port number.
	 *
	 * It will power the /fatima endpoint, allowing secret reloading based on cloud changes  */
	reload?: number;
}
