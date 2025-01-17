import { writeFileSync } from "fs";
import { createClient } from "src/cli/utils/create-client";
import { createDeclaration } from "src/cli/utils/create-declaration";
import path from "path";
import { logger } from "../utils/logger";
import { getConfig } from "../utils/get-config";
import { config as loadEnv, parse } from "dotenv";

export async function generateAction(options?: { config?: string }) {
  const config = await getConfig(options?.config);

  const generate =
    config.generate === "both" ? ["declaration", "client"] : [config.generate];

  const processEnv = loadEnv().parsed ?? {};

  const env = (await config.loader({ parse, processEnv })) ?? {};

  if (generate.includes("declaration")) {
    const declarationPath = path.resolve(
      config.location.folderPath,
      "env.d.ts"
    );

    const declaration = createDeclaration(env);

    writeFileSync(declarationPath, declaration);
  }

  if (generate.includes("client")) {
    let clientPath = path.resolve(config.location.folderPath, config.output);

    let client = createClient(config.client, clientPath);

    let environmentVariablesType: string;

    let environmentVariablesNames = Object.keys(env);

    if (generate.includes("declaration")) {
      environmentVariablesType =
        "type EnvironmentVariables = keyof typeof process.env";
    } else {
      environmentVariablesType = `type EnvironmentVariables = "${environmentVariablesNames.join('" ' + "|" + ' "')}"`;
    }

    client = client.replace(
      /type EnvironmentVariables = '';/,
      environmentVariablesType
    );

    logger.success(
      `Successfully generated env.ts with ${environmentVariablesNames.length} environment variables`
    );

    writeFileSync(clientPath, client);
  }
}
