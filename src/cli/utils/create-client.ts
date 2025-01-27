import { DotsafeClientOptions } from "src/dotsafe/types";
import { txt } from "src/dotsafe/utils/txt";

type ClientStrings = {
  envKeys: string;
  createEnvArg: string;
  createPublicEnvArg?: string;
  publicPrefix?: string;
};

const client = (strings: ClientStrings) => [
  'import { createEnv, createPublicEnv, EnvRecord, PublicEnvRecord } from "@dotsafe/dotsafe/env";',
  "",

  strings.envKeys
    ? `export type EnvKeys = ${strings.envKeys};
  `
    : "export type EnvKeys = ''",
  "",

  `export const env = createEnv(${strings.createEnvArg}) as EnvRecord<EnvKeys, ${strings.publicPrefix}>;`,
  "",

  strings.createPublicEnvArg
    ? `export const publicEnv = createPublicEnv(${strings.createPublicEnvArg}) as PublicEnvRecord<EnvKeys, ${strings.publicPrefix}>;`
    : "",
];

export function createClient(envs: string[], options: DotsafeClientOptions) {
  let createPublicEnvArg: string | undefined = undefined;

  const publicKeys = options.publicPrefix
    ? envs.filter((e) => e.startsWith(options.publicPrefix as string))
    : null;

  if (publicKeys) {
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

  const envKeys = '\n  | "' + envs.join('" \n  | "') + '"';

  return client({
    createEnvArg,
    createPublicEnvArg,
    envKeys,
    publicPrefix: options.publicPrefix ? `"${options.publicPrefix}"` : "",
  }).join("\n");
}
