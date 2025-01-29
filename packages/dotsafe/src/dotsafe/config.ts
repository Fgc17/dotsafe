import { DotsafeClientOptions, DotsafeLoader, DotsafeValidator } from "./types";
import { getCallerLocation } from "./utils/get-caller-location";

export type DotsafeOptions = {
  /**
   * Anything you return here will turn into the environment variables
   *
   * Check README for more information on built-in loaders
   */
  load: DotsafeLoader;
  /**
   * Environment options
   */
  client?: DotsafeClientOptions;
  /**
   * Function that will be executed with ``dotsafe validate``
   */
  validate?: DotsafeValidator;
  /**
   * Output path for the generated file (always relative to the config file)
   *
   * @default "./env.ts" or "./src/env.service.ts" for NestJS
   */
  output?: string;
};

export type DotsafeConfig = ReturnType<typeof config>;

export function config({
  output = "./env.ts",
  load,
  client,
  validate,
}: DotsafeOptions) {
  const { filePath, folderPath } = getCallerLocation();

  return {
    client,
    output,
    load,
    validate,
    location: {
      filePath,
      folderPath,
    },
  };
}
