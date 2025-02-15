import { select } from "@inquirer/prompts";
import { findNestedPackage } from "src/utils/has-nested-package";

export async function askMonorepo() {
	const hasNestedPackage = findNestedPackage();

	if (!hasNestedPackage) return;

	const willQuit = await select({
		message:
			"This will initialize fatima at your workspace root. Are you sure?",
		choices: [
			{
				name: "Yes, continue.",
				value: false,
			},
			{
				name: "Quit, I will run this at the package/app directory",
				value: true,
			},
		],
	});

	if (willQuit) throw "Exiting...";
}
