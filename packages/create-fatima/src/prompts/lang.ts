import { select } from "@inquirer/prompts";

export const askLanguage = async () =>
	await select({
		message: "Choose the language you want to use",
		choices: [
			{
				name: "TypeScript (.ts)",
				value: "typescript",
			},
			{
				name: "JavaScript (.js)",
				value: "javascript",
				description: "Fatima provides full type safety via JSDoc.",
			},
		],
	});
