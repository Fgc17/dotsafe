import { writeFileSync } from "fs";
import path from "path";
import { FatimaConfig } from "src/core/config";
import { UnsafeEnvironmentVariables } from "src/core/types";
import { getTypescriptClient } from "../client/typescript-client";
import { getJavascriptClient } from "../client/javascript-client";

export function createClient(
	config: FatimaConfig,
	env: UnsafeEnvironmentVariables,
) {
	let clientPath = path.resolve(
		config.file.folderPath,
		`env${config.file.extension}`,
	);

	let envs = Object.keys(env ?? {});

	const isTypescript = config.file.path.endsWith("ts");

	let client = isTypescript
		? getTypescriptClient(envs, config.client)
		: getJavascriptClient(envs, config.client);

	writeFileSync(clientPath, client);
}
