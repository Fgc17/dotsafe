import { Promisable } from "./utils/types";

export type UnsafeEnvironmentVariables = Record<string, string>;

export type FatimaContext = {
  configPath: string;
};

export type FatimaLoadFunction = () => Promisable<
  UnsafeEnvironmentVariables | null | undefined
>;

export type FatimaLoaderChain = FatimaLoadFunction[] | FatimaLoadFunction;

export type FatimaLoader = {
  development: FatimaLoaderChain;
  [nodeEnv: string]: FatimaLoaderChain;
};

export type FatimaValidator = (
  env: UnsafeEnvironmentVariables,
  context: FatimaContext
) => Promisable<{
  isValid: boolean;
  errors?: Array<{
    key: string;
    message: string;
  }>;
}>;

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
