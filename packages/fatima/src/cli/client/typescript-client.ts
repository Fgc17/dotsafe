import { FatimaClientOptions } from "src/core/types";
import { txt } from "src/core/utils/txt";

type ClientStrings = {
  envKeys: string;
  envClass: string;
  createEnvArg: string;
  createPublicEnvArg?: string;
  publicPrefix?: string;
};

const client = (strings: ClientStrings) => [
  'import { createEnv, ServerEnvRecord } from "fatima/env";',
  "",

  strings.envKeys
    ? `export type EnvKeys = ${strings.envKeys};`
    : "export type EnvKeys = ''",
  "",

  `export type EnvRecord<V = string> = Record<EnvKeys, V>;`,
  "",

  `export interface EnvClass {`,
  `  ${strings.envClass}`,
  `}`,
  "",

  `export type EnvType<Type extends { [key in EnvKeys]?: any } = { [key in EnvKeys]?: string }> = Type;`,
  "",

  `type Env = ServerEnvRecord<EnvKeys, ${strings.publicPrefix}>`,
  "",

  `export const env = createEnv(${strings.createEnvArg}) as Env;`,
  "",

  strings.createPublicEnvArg
    ? txt(
        `import {createPublicEnv, PublicEnvRecord } from "fatima/env";`,
        `type PublicEnv = PublicEnvRecord<EnvKeys, ${strings.publicPrefix}>`,
        `export const publicEnv = createPublicEnv(${strings.createPublicEnvArg}) as PublicEnv;`
      )
    : "",
];

export function getTypescriptClient(
  envs: string[],
  options: FatimaClientOptions = {}
) {
  const publicKeys = options.publicPrefix
    ? envs.filter((e) => e.startsWith(options.publicPrefix as string))
    : [];

  let createPublicEnvArg: string | undefined = undefined;
  if (publicKeys?.length) {
    const publicVariables = `${publicKeys.map((key) => `    ${key}: process.env.${key} as string`).join(",\n")}`;

    createPublicEnvArg = txt(
      `  {`,
      `  publicPrefix: "${options.publicPrefix}",`,
      `  publicVariables: {`,
      `${publicVariables}`,
      `  }`,
      `}`
    );
  }

  const createEnvArg = `{ isServer: ${options.isServer ? options.isServer.toString() : undefined} }`;

  const envKeys = '\n  | "' + envs.sort().join('" \n  | "') + '"';

  const envClass = envs.map((key) => `"${key}": string;`).join("\n  ");

  const publicPrefix = options.publicPrefix
    ? `"${options.publicPrefix}"`
    : `"PUBLIC_"`;

  return client({
    createEnvArg,
    createPublicEnvArg,
    envKeys,
    envClass,
    publicPrefix,
  }).join("\n");
}
