import { UnsafeEnvironmentVariables } from "src/core/types";

export function populateProcessEnv(env: UnsafeEnvironmentVariables) {
  Object.assign(process.env, env, { FORCE_COLOR: "1", TS_ENV: "1" });
}
