import { program } from "commander";
import { generateAction } from "./actions/generate";
import { runAction } from "./actions/run";
import { getActionArgs } from "./utils/get-action-args";

program
  .name("ts-env")
  .description("Typesafe environment variables for TypeScript")
  .version("0.0.0");

program
  .command("generate")
  .option("--config <config>", "Config file path")
  .action(async (options) => {
    const actionArgs = await getActionArgs(options);

    await generateAction(actionArgs);
  });

program
  .command("run")
  .argument("<command...>", "The command to execute after --")
  .option("--config <config>", "Config file path")
  .option("-g, --generate", "Runs generate before running the command")
  .action(async (args, options) => {
    const actionArgs = await getActionArgs(options);

    if (options.generate) {
      await generateAction(actionArgs);
    }

    await runAction(actionArgs, args);
  });

program.parse();
