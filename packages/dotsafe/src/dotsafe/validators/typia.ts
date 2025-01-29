import { DotsafeValidator, UnsafeEnvironmentVariables } from "../types";
import { getConfig } from "src/cli/utils/get-config";
import { InternalDotsafeTempFolderName } from "../utils/tmp";

import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

export type TypiaFunction = (env: UnsafeEnvironmentVariables) => {
  success: boolean;
  data?: any;
  errors?: IError[];
};

interface IError {
  path: string;
  expected: string;
  value: any;
}

export const typia = (fn: TypiaFunction): DotsafeValidator => {
  return async (env: any, { configPath }) => {
    if (!configPath.includes(InternalDotsafeTempFolderName)) {
      const configDir = path.dirname(configPath);
      const tempFolderPath = path.join(
        configDir,
        `${InternalDotsafeTempFolderName}-${Date.now()}`
      );
      await fs.mkdir(tempFolderPath);

      const tempConfigPath = path.join(
        tempFolderPath,
        path.basename(configPath)
      );

      await fs.copyFile(configPath, tempConfigPath);

      const tempTypiaOutputPath = path.join(tempFolderPath, "dist");
      await fs.mkdir(tempTypiaOutputPath);

      const typiaCommand = "typia";
      const args = [
        "generate",
        "--input",
        tempFolderPath,
        "--output",
        tempTypiaOutputPath,
        "--project",
        "tsconfig.json",
      ];

      await new Promise<void>((resolve, reject) => {
        const process = spawn(typiaCommand, args, { shell: true });

        process.stdout.on("data", () => {});

        process.stderr.on("data", () => {});

        process.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });

      const transformedConfigPath = path.join(
        tempTypiaOutputPath,
        path.basename(configPath)
      );

      const transformedConfig = await getConfig(transformedConfigPath);

      const validate = transformedConfig.validate!;

      const result = validate(env, { configPath: transformedConfigPath });

      await fs.rm(tempFolderPath, { recursive: true });

      return result;
    }

    const result = fn(env);

    const isValid = result.success;

    const errors = result.errors?.map((error) => ({
      key: error.path.replace("$input.", ""),
      message: error.expected,
    }));

    return {
      isValid,
      errors,
    };
  };
};
