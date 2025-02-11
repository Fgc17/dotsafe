import type { Promisable } from "./utils/types";

export type UnsafeEnvironmentVariables = Record<string, string>;

export type FatimaEnvironment = string;

export type FatimaContext = {
	configPath: string;
};

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

export type FatimaParsedValidationErrors = Record<string, string[]>;

export type FatimaValidator = (
	env: UnsafeEnvironmentVariables,
	context: FatimaContext,
) => Promisable<{
	isValid: boolean;
	errors?: FatimaValidatorError[];
}>;

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

export interface FatimaHookOptions {
	port: number;
}
