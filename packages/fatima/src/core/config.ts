import path from "path";
import { FatimaClientOptions, FatimaLoader, FatimaValidator } from "./types";
import { getCallerLocation } from "./utils/get-caller-location";
import { logger } from "./utils/logger";

export type FatimaOptions = {
  /**
   * Anything you return here will turn into the environment variables
   *
   * Check docs for more information on built-in loaders
   */
  load: FatimaLoader;
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

export function config({ load, client, validate }: FatimaOptions) {
  const { filePath: configFilePath, folderPath: configFolderPath } =
    getCallerLocation();

  const configExtension = path.extname(configFilePath);

  return {
    client,
    load,
    validate,
    file: {
      extension: configExtension,
      path: configFilePath,
      folderPath: configFolderPath,
    },
    __fatimaconfig: true,
  };
}
