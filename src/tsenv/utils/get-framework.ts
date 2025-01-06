import { existsSync } from "fs";
import { resolve } from "path";

export function getFramework(configFolder: string) {
  const isNest = existsSync(resolve(configFolder, "./nest-cli.json"));

  if (isNest) {
    return "nestjs";
  }

  return null;
}
