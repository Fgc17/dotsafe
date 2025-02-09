import { createEnv, type ServerEnvRecord } from "fatima/env";

export type EnvKeys = "NODE_ENV" | "TZ" | "NEXT_PUBLIC_API_URL";

export type EnvRecord<V = string> = Record<EnvKeys, V>;

export interface EnvClass {
	NODE_ENV: string;
	TZ: string;
	NEXT_PUBLIC_API_URL: string;
}

export type EnvType<
	Type extends { [key in EnvKeys]?: unknown } = { [key in EnvKeys]?: string },
> = Type;

type Env = ServerEnvRecord<EnvKeys, "NEXT_PUBLIC_">;

export const env = createEnv({ isServer: undefined }) as Env;
