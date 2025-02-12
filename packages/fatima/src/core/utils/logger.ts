import { fatimaEnv } from "./fatima-env";

const join = (message: string[]) => {
	const env = fatimaEnv.get() ?? "EnvironmentNotFound";

	return `🔒 [fatima] (${env}) ` + message.join("\n ");
};

const block = (message: string) => {
	const isFirstLog = process.env.FATIMA_LOGS === "1";

	let block = message;

	if (isFirstLog) {
		block = "\r" + block;
	}

	if (!isFirstLog || !process.env.npm_package_version) {
		block = "\n" + block;
	}

	return block;
};

const colors = {
	error: [31, 39],
	success: [32, 39],
	warn: [33, 39],
	info: [34, 39],
};

type LogTheme = keyof typeof colors;

const logger: Record<LogTheme, (...messages: string[]) => void> = Object.keys(
	colors,
).reduce(
	(acc, level) => {
		acc[level as LogTheme] = (...messages: string[]) => {
			const [open, close] = colors[level as LogTheme];
			const message = join(messages);
			process.env.FATIMA_LOGS = (
				Number(process.env.FATIMA_LOGS ?? "0") + 1
			).toString();
			console.log(`\u001B[${open}m ${block(message)} \u001B[${close}m`);
		};
		return acc;
	},
	{} as Record<LogTheme, (...messages: string[]) => void>,
);

export { logger };
