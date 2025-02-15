import { watch } from "node:fs";
import { reloadEnv } from "src/cli/utils/reload-env";
import type { FatimaConfig } from "src/core/config";
import type { UnsafeEnvironmentVariables } from "src/core/types";
import type { Promisable } from "../types";
import { debounce } from "../utils/debounce";

export function listenLocalEnv(
	config: FatimaConfig,
	callback?: (env: UnsafeEnvironmentVariables) => Promisable<void>,
) {
	return watch(
		config.file.folderPath,
		debounce(async (_, filename: string | null) => {
			if (
				!filename ||
				!filename.endsWith(".env") ||
				filename.startsWith(".tmp") ||
				filename === ".example.env"
			)
				return;

			const { env } = await reloadEnv(config);

			await callback?.(env);
		}, 100),
	);
}
