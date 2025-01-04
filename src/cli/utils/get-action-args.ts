import path from "path";
import { TSEnvConfig } from "src/config";
import { readConfig } from "./read-config";

export type ActionArgs = {
  configPath: string;
  configFolder: string;
  config: TSEnvConfig;
};

export const getActionArgs = async (options: any): Promise<ActionArgs> => {
  const projectRoot = process.cwd();

  const configPath = path.resolve(
    projectRoot,
    options.config ?? "./env.config.ts"
  );

  const configFolder = path.dirname(configPath);

  const config = await readConfig(configPath);

  return {
    configPath,
    configFolder,
    config,
  };
};
