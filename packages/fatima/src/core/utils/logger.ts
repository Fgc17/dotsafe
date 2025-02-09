import { fatimaEnv } from "./fatima-env";

const join = (message: string[]) =>
	`🔒 [fatima] (${fatimaEnv.get()}) ` + message.join("\n ");

const block = (message: string) => {
	let block = message + "\n";

	if (!process.env.npm_package_version) {
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
			console.log(`\u001B[${open}m ${block(message)} \u001B[${close}m`);
		};
		return acc;
	},
	{} as Record<LogTheme, (...messages: string[]) => void>,
);

export { logger };
