import { program } from "commander";
import { generateAction } from "./actions/generate";
import { runAction } from "./actions/run";
import { validateAction } from "./actions/validate";

program
  .name("dotsafe")
  .description("Typesafe environment variables for TypeScript")
  .version("0.0.0");

program
  .command("generate")
  .option("--config <config>", "Config file path")
  .option("-g, --generate", "Generates the declaration file")
  .option("-v, --validate", "Validates with the validate function")
  .action(async (args, options) => {
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
  .command("run")
  .argument("<command...>", "The command to execute after --")
  .option("--config <config>", "Config file path")
  .option("-g, --generate", "Runs generate before running the command")
  .action(async (args, options) => {
    if (options.generate) {
      await generateAction(options);
    }

    await runAction(options, args);
  });

program.parse();
