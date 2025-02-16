import { spawn } from "node:child_process";
import { logger } from "src/lib/logger/logger";
import { createClient } from "src/lib/client/generate-client";
import { createInjectableEnv, updateChildEnv } from "src/lib/env/patch-env";
import { fatimaStore } from "src/lib/store/store";
import { createAction, type ActionContext } from "../utils/create-action";
import { listenLocalEnv } from "src/lib/listeners/local-env";
import { listenRemoteEnv } from "src/lib/listeners/remote-env";

const environmentBlacklist = [
	"production",
	"prod",
	"staging",
	"stg",
	"preview",
	"pre",
	"prev",
	"preprod",
];

export const devService = async ({
	config,
	env,
	envCount,
	args,
}: ActionContext) => {
	fatimaStore.set("fatimaDevMode", "true");

	const environment = fatimaStore.get("fatimaEnvironment") as string;

	if (environmentBlacklist.includes(environment)) {
		logger.error(
			`Your 'config.environment()' function returned '${environment}', you can't run 'fatima dev' in this environment.`,
		);
		process.exit(1);
	}

	if (!fatimaStore.get("fatimaLiteMode")) {
		createClient(config, env);
	}

	logger.success(`Loaded ${envCount} environment variables`);

	const injectableEnv = createInjectableEnv(env);

	const cmd = args.shift();

	const child = spawn(cmd as string, args, {
		env: injectableEnv,
		shell: false,
		stdio: ["inherit", "inherit", "inherit", "ipc"],
	});

	const localEnvListener = listenLocalEnv(config, updateChildEnv);

	const remoteEnvListener = listenRemoteEnv(config, updateChildEnv);

	child.on("error", (error) => {
		console.error(`Error: ${error.message}`);
		localEnvListener.close();
		remoteEnvListener?.close();
		process.exit(1);
	});

	child.on("close", (code) => {
		if (code !== 0) {
			console.error(`Command exited with code ${code}`);
			localEnvListener.close();
			remoteEnvListener?.close();
			process.exit(code);
		}
	});
};

export const devAction = createAction(devService);
