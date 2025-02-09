import { createEnv, type ServerEnvRecord } from "fatima/env";

export type EnvKeys = "NEXT_PUBLIC_API_URL" | "NODE_ENV" | "TZ";

export type EnvRecord<V = string> = Record<EnvKeys, V>;

export interface EnvClass {
	NEXT_PUBLIC_API_URL: string;
	NODE_ENV: string;
	TZ: string;
}

export type EnvType<
	Type extends { [key in EnvKeys]?: unknown } = { [key in EnvKeys]?: string },
> = Type;

type Env = ServerEnvRecord<EnvKeys, "NEST_PUBLIC">;

export const env = createEnv({ isServer: undefined }) as Env;
