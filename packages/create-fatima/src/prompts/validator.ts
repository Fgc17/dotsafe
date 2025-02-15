import { select } from "@inquirer/prompts";
import type { InquirerSelectChoice, Language } from "src/lib/types";

const tsChoices: InquirerSelectChoice = [
	{
		name: "class-validator",
		value: "class-validator",
	},
	{
		name: "typia",
		value: "typia",
	},
];

const getTsChoices = (lang: Language) =>
	lang === "typescript" ? tsChoices : [];

export const askValidator = async (language: Language) =>
	(await select({
		message: "Select a validator",
		choices: [
			{
				name: "I'll build my own validator",
				value: "custom",
				description: "It is also pretty easy.",
			},
			{
				name: "zod",
				value: "zod",
			},
			...getTsChoices(language),
		],
	})) as string;
