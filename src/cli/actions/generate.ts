import { writeFileSync } from "fs";
import { createClient } from "src/cli/utils/create-client";
import { createDeclaration } from "src/cli/utils/create-declaration";
import path from "path";
import { ActionArgs } from "../utils/get-action-args";
import { logger } from "../utils/logger";

export async function generateAction({ config, configFolder }: ActionArgs) {
  const generate =
    config.generate === "both" ? ["declaration", "client"] : [config.generate];

  const env = (await config.loader()) ?? {};

  if (generate.includes("declaration")) {
    const declarationPath = path.resolve(configFolder, ".d.ts");

    const declaration = createDeclaration(env);

    writeFileSync(declarationPath, declaration);
  }

  if (generate.includes("client")) {
    const clientPath = path.resolve(configFolder, "env.ts");

    let client = createClient();

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
