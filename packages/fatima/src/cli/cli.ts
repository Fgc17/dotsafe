#!/usr/bin/env node

import { program } from "commander";
import { generateAction } from "./actions/generate";
import { devAction } from "./actions/dev";
import { validateAction } from "./actions/validate";
import { runAction } from "./actions/run";
import { initializeEnv } from "src/lib/env/patch-env";
import { reloadAction } from "./actions/reload";

initializeEnv();

const configOption = "-c, --config <config>, --config=<config>";

const configOptionDescription = "Config file path";

program
	.name("fatima")
	.version("0.0.8")
	.description("typesafe environment variables for the js ecosystem");

program
	.command("generate")
	.option(configOption, configOptionDescription)
	.action(generateAction);

program
	.command("dev")
	.option(configOption, configOptionDescription)
	.option("-l, --lite", "Lite mode, won't generate client")
	.argument("<command...>", "The command to execute after --")
	.action(devAction);

program
	.command("run")
	.option(configOption, configOptionDescription)
	.argument("<command...>", "The command to execute after --")
	.action(runAction);

program
	.command("validate")
	.option(configOption, configOptionDescription)
	.action(validateAction);

program
	.command("reload")
	.option(configOption, configOptionDescription)
	.action(reloadAction);

program.parse();
