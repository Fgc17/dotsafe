import { UnsafeEnvironmentVariables } from "src/core/types";

export function createInjectableEnv(env?: UnsafeEnvironmentVariables) {
  return {
    ...process.env,
    ...env,
  } as UnsafeEnvironmentVariables;
}

export function populateEnv(env: UnsafeEnvironmentVariables = {}) {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development";
  }

  process.env = {
    ...process.env,
    ...env,
    FORCE_COLOR: "1",
    TS_ENV: "1",
  };
}
