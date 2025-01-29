import { UnsafeEnvironmentVariables } from "../types";

export interface DotenvLoadArgs {
  config: () => {
    parsed?: any;
  };
}

const load = (dotenv: DotenvLoadArgs) => {
  const env = (dotenv.config().parsed ?? {}) as UnsafeEnvironmentVariables;

  if (!env.NODE_ENV) {
    env.NODE_ENV = "development";
  }

  if (!env.TZ) {
    env.TZ = process.env.TZ ?? "UTC";
  }

  return env;
};

export const dotenv = {
  load,
};
