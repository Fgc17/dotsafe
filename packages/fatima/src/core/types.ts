import { Promisable } from "./utils/types";

export type UnsafeEnvironmentVariables = Record<string, string>;

export type DotsafeContext = {
  configPath: string;
};

export type DotsafeLoader = ({
  processEnv,
}: {
  processEnv: UnsafeEnvironmentVariables;
}) => Promisable<UnsafeEnvironmentVariables | null | undefined>;

export type DotsafeValidator = (
  env: UnsafeEnvironmentVariables,
  context: DotsafeContext
) => Promisable<{
  isValid: boolean;
  errors?: Array<{
    key: string;
    message: string;
  }>;
}>;

export interface DotsafeClientOptions {
  /**
   * Prefix for the client
   */
  publicPrefix?: string;
  /**
   * Function to verify server environment
   */
  isServer?: () => boolean;
}
