import { createEnv, EnvRecord } from "@dotsafe/dotsafe/env";

export type EnvKeys = 
  | "NODE_ENV" 
  | "TZ";

export type EnvConstraint<Record extends { [key in EnvKeys]?: any } = { [key in EnvKeys]?: string }> = Record;

type Env = EnvRecord<EnvKeys, "NEXT_PUBLIC_">

export const env = createEnv({ isServer: undefined }) as Env;


