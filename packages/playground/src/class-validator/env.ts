import {
  createEnv,
  type ServerEnvRecord,
  type EnvType as FatimaEnvType,
  type EnvRecord as FatimaEnvRecord,
  type PrimitiveEnvType as FatimaPrimitiveEnvType,
} from 'fatima/env';

export interface EnvObject {
  "NODE_ENV": string;
  "TZ": string;
  "NEXT_PUBLIC_API_URL": string;
  "TEST": string;
}

export type EnvKeys = keyof EnvObject;

export type EnvRecord<V = string> = FatimaEnvRecord<EnvObject, V>;

type PrimitiveEnvType = FatimaPrimitiveEnvType<EnvObject>;
export type EnvType<T extends PrimitiveEnvType> = FatimaEnvType<EnvObject, T>;

type Env = ServerEnvRecord<EnvKeys, "NEST_PUBLIC">

export const env = createEnv({ isServer: undefined }) as Env;

