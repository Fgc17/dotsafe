import {
	existsSync,
	readFileSync,
	appendFileSync,
	writeFileSync,
} from "node:fs";
import path, { join } from "node:path";
import type { AnyType } from "../lib/types";

function getGitignorePath() {
	let currentDir = process.cwd();

	while (currentDir !== path.parse(currentDir).root) {
		const gitignorePath = path.join(currentDir, ".gitignore");
		if (existsSync(gitignorePath)) {
			return gitignorePath;
		}
		currentDir = path.dirname(currentDir);
	}

	return null;
}

export function tweakUserConfig(
	fileName: string,
	modifier: (config: AnyType) => AnyType,
) {
	if (fileName === ".gitignore") {
		const gitignorePath = getGitignorePath();

		if (!gitignorePath) return;

		const currentContent = readFileSync(gitignorePath, "utf8");

		const newContent = modifier(currentContent);

		if (newContent !== currentContent) {
			appendFileSync(gitignorePath, `\n${newContent}`);
		}

		return;
	}

	const filePath = join(process.cwd(), fileName);

	let config = {};

	if (existsSync(filePath)) {
		config = JSON.parse(readFileSync(filePath, "utf8"));
	}

	const updatedConfig = modifier(config);

	writeFileSync(filePath, JSON.stringify(updatedConfig, null, 2));

	return updatedConfig;
}
