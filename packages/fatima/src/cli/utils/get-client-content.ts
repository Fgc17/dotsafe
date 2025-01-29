import { DotsafeClientOptions } from "src/core/types";
import { txt } from "src/core/utils/txt";

type ClientStrings = {
  envKeys: string;
  createEnvArg: string;
  createPublicEnvArg?: string;
  publicPrefix?: string;
};

const client = (strings: ClientStrings) => [
  'import { createEnv, EnvRecord } from "fatima/env";',

  strings.createPublicEnvArg
    ? `import {createPublicEnv, PublicEnvRecord } from "fatima/env";`
    : "",

  strings.envKeys
    ? `export type EnvKeys = ${strings.envKeys};`
    : "export type EnvKeys = ''",
  "",

  `export type EnvConstraint<Record extends { [key in EnvKeys]?: any } = { [key in EnvKeys]?: string }> = Record;`,
  "",

  `type Env = EnvRecord<EnvKeys, ${strings.publicPrefix}>`,
  "",

  `export const env = createEnv(${strings.createEnvArg}) as Env;`,
  "",

  strings.createPublicEnvArg
    ? `type PublicEnv = PublicEnvRecord<EnvKeys, ${strings.publicPrefix}>`
    : "",

  strings.createPublicEnvArg
    ? `export const publicEnv = createPublicEnv(${strings.createPublicEnvArg}) as PublicEnv;`
    : "",
];

export function getClientContent(
  envs: string[],
  options: DotsafeClientOptions = {}
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

  return client({
    createEnvArg,
    createPublicEnvArg,
    envKeys,
    publicPrefix: options.publicPrefix ? `"${options.publicPrefix}"` : "",
  }).join("\n");
}
