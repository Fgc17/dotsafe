import { select, Separator } from "@inquirer/prompts";
import chalk from "chalk";

const separator = (label: string) => new Separator(chalk.blue("↘ " + label));

export const askAdapter = async () =>
	await select({
		message: "Select an adapter",
		choices: [
			separator("Common"),
			{
				name: "I'll build my own adapter",
				value: "custom",
				description: "It is pretty easy.",
			},
			{
				name: "dotenv (local only)",
				value: "dotenv",
			},
			separator("Secret Managers"),
			{
				name: "infisical",
				value: "infisical",
			},
			separator("Hosting Platforms"),
			{
				name: "vercel",
				value: "vercel",
			},
			{
				name: "trigger.dev",
				value: "triggerdev",
			},
		],
	});
