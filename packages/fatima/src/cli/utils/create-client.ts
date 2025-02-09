import { writeFileSync } from "node:fs";
import path from "node:path";
import type { FatimaConfig } from "src/core/config";
import type { UnsafeEnvironmentVariables } from "src/core/types";
import { getTypescriptClient } from "../client/typescript-client";
import { getJavascriptClient } from "../client/javascript-client";

export function createClient(
	config: FatimaConfig,
	env: UnsafeEnvironmentVariables,
) {
	const clientPath = path.resolve(
		config.file.folderPath,
		`env${config.file.extension}`,
	);

	const envs = Object.keys(env ?? {});

	const isTypescript = config.file.path.endsWith("ts");

	const client = isTypescript
		? getTypescriptClient(envs, config.client)
		: getJavascriptClient(envs, config.client);

	writeFileSync(clientPath, client);
}
