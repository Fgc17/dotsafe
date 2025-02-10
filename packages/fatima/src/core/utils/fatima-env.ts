export const fatimaEnv = {
	get() {
		return process.env.FATIMA_ENV as string;
	},
	set(env?: string) {
		process.env.FATIMA_ENV = env?.toLocaleLowerCase();
	},
};
