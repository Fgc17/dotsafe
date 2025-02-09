import { select, Separator } from "@inquirer/prompts";
import { execSync } from "child_process";

import fs from "fs";
import path from "path";

function hasNestedPackage(directory = process.cwd()) {
	function search(dir: string, isRoot = true) {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const fullPath = path.join(dir, file);
			if (file === "node_modules" || file.startsWith(".")) {
				continue;
			}
			if (file === "package.json" && !isRoot) {
				return true;
			}
			if (fs.statSync(fullPath).isDirectory()) {
				if (search(fullPath, false)) {
					return true;
				}
			}
		}
		return false;
	}

	return search(directory);
}

function getGitignorePath() {
	try {
		const gitRoot = execSync("git rev-parse --show-toplevel", {
			encoding: "utf-8",
		}).trim();
		const gitignorePath = path.join(gitRoot, ".gitignore");
		return gitignorePath;
	} catch (error) {
		console.error("Error: Not a git repository or .gitignore not found");
		return null;
	}
}

export const initAction = async () => {
	if (hasNestedPackage()) {
		const willQuit = await select({
			message:
				"Looks like this will initialize fatima at your monorepo root. Is this correct?",
			choices: [
				{
					name: "This is correct, continue.",
					value: false,
				},
				{
					name: "Quit, I will run this at the package/app directory",
					value: true,
				},
			],
		});

		if (willQuit) {
			return;
		}
	}

	const validator = await select({
		message: "Select a validator",
		choices: [
			{
				name: "I'll build my own",
				value: "custom",
				description: "I get it, you are a pro.",
			},
			{
				name: "zod",
				value: "zod",
				description:
					"TypeScript-first schema validation with static type inference",
			},
			{
				name: "class-validator",
				value: "class-validator",
				description: "Decorator-based property validation for classes.",
			},
			new Separator(),
			{
				name: "jspm",
				value: "jspm",
				disabled: true,
			},
			{
				name: "pnpm",
				value: "pnpm",
				disabled: "(pnpm is not available)",
			},
		],
	});
};
