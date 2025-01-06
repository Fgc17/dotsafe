import { getFramework } from "./utils/get-framework";
import { ClientType, TSEnvLoader } from "./types";
import { getCallerLocation } from "./utils/get-caller-location";

export type TSEnvOptions = {
  /**
   * Anything you return here will turn into the environment variables
   *
   * Check README for more information on built-in loaders
   */
  loader: TSEnvLoader;
  /**
   * Generate only the declaration file, only the client file or both
   */
  generate?: "declaration" | "client" | "both";
  /**
   * Client type to generate
   * @default ClientType.Functional
   */
  client?: ClientType;
  /**
   * Output path for the generated file (always relative to the config file)
   *
   * @default "./env.ts" or "./src/env.service.ts" for NestJS
   */
  output?: string;
};

export type TSEnvConfig = ReturnType<typeof config>;

export function config({
  generate = "client",
  client,
  output,
  loader,
}: TSEnvOptions) {
  const { filePath, folderPath } = getCallerLocation();

  const framework = getFramework(folderPath);

  if (framework === "nestjs") {
    client = ClientType.NestJS;
  }

  if (!output && client === ClientType.NestJS) {
    output = "./src/env.service.ts";
  }

  if (!output) {
    output = "./env.ts";
  }

  if (!client) {
    client = ClientType.Functional;
  }

  return {
    generate,
    client,
    output,
    loader,
    location: {
      filePath,
      folderPath,
    },
  };
}
