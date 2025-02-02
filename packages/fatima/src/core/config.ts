import path from "path";
import {
  FatimaClientOptions,
  FatimaEnvironment,
  FatimaEnvironmentFunction,
  FatimaLoadObject,
  FatimaValidator,
} from "./types";
import { getCallerLocation } from "./utils/get-caller-location";
import { lifecycle } from "./lifecycle";

export type FatimaOptions<
  Environments extends FatimaEnvironment = FatimaEnvironment,
> = {
  /**
   * Anything you return here will turn into the environment variables
   *
   * Check docs for more information on built-in loaders
   */
  load: FatimaLoadObject<Environments>;
  /**
   * The environment to pull the variables from, will be used in the load object.
   */
  environment: FatimaEnvironmentFunction;
  /**
   * Environment options
   */
  client?: FatimaClientOptions;
  /**
   * Function that will be executed with ``fatima validate``
   */
  validate?: FatimaValidator;
};

export type FatimaConfig = ReturnType<typeof config>;

export function config<Environments extends FatimaEnvironment>({
  load,
  environment,
  client,
  validate,
}: FatimaOptions<Environments>) {
  const { filePath: configFilePath, folderPath: configFolderPath } =
    getCallerLocation();

  const configExtension = path.extname(configFilePath);

  if (!environment) {
    lifecycle.error.missingEnvironmentConfig();

    process.exit(1);
  }

  return {
    client,
    load,
    validate,
    environment,
    file: {
      extension: configExtension,
      path: configFilePath,
      folderPath: configFolderPath,
    },
    __fatimaconfig: true,
  };
}
