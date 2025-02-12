import {
  createEnv,
  type ServerEnvRecord,
  type EnvType as FatimaEnvType,
  type EnvRecord as FatimaEnvRecord,
  type PrimitiveEnvType as FatimaPrimitiveEnvType,
} from 'fatima/env';

export type EnvKeys = 
  | "NEXT_PUBLIC_API_URL" 
  | "NODE_ENV" 
  | "TEST" 
  | "TZ";

export type EnvRecord<V = string> = FatimaEnvRecord<EnvKeys, V>;

export interface EnvClass {
  "NEXT_PUBLIC_API_URL": string;
  "NODE_ENV": string;
  "TEST": string;
  "TZ": string;
}

type PrimitiveEnvType = FatimaPrimitiveEnvType<EnvKeys>;
export type EnvType<T extends PrimitiveEnvType> = FatimaEnvType<EnvKeys, T>;

type Env = ServerEnvRecord<EnvKeys, "NEXT_PUBLIC_">

export const env = createEnv({ isServer: undefined }) as Env;

import { createPublicEnv, type PublicEnvRecord } from "fatima/env";
type PublicEnv = PublicEnvRecord<EnvKeys, "NEXT_PUBLIC_">
export const publicEnv = createPublicEnv(  {
  publicPrefix: "NEXT_PUBLIC_",
  publicVariables: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL as string
  }
}) as PublicEnv;