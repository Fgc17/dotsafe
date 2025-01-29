import { program } from "commander";
import { generateAction } from "./actions/generate";
import { devAction } from "./actions/dev";
import { validateAction } from "./actions/validate";
import { runAction } from "./actions/run";

program
  .name("fatima")
  .description("typesafe environment variables for the js ecosystem")
  .version("0.0.0");

program
  .command("generate")
  .option("--config <config>", "Config file path")
  .option("-g, --generate", "Generates the declaration file")
  .option("-v, --validate", "Validates with the validate function")
  .action(async (options) => {
    if (options.validate) {
      await validateAction(options);
    }

    await generateAction(options);
  });

program
  .command("validate")
  .option("--config <config>", "Config file path")
  .option("-v, --validate", "Validates with the validate function")
  .action(validateAction);

program
  .command("dev")
  .argument("<command...>", "The command to execute after --")
  .option("--config <config>", "Config file path")
  .option("--port <port>", "Open a port for hot reloading")
  .action(devAction);

program
  .command("run")
  .argument("<command...>", "The command to execute after --")
  .option("--config <config>", "Config file path")
  .action(runAction);

program.parse();
