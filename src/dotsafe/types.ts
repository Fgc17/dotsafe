import { DotenvParseOutput } from "dotenv";

export type UnsafeEnvironmentVariables = Record<string, string>;

export type DotsafeLoader = (env: {
  processEnv: DotenvParseOutput;
  parse: <T extends DotenvParseOutput>(src: string | Buffer) => T;
}) => Promise<UnsafeEnvironmentVariables | null | undefined>;

export type DotsafeValidator = (env: UnsafeEnvironmentVariables) => {
  isValid: boolean;
  errors?: Array<{
    key: string;
    message: string;
  }>;
};

export interface GenericClass<T> extends Function {
  new (...args: any[]): T;
}

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
