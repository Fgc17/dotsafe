export const fatimaEnv = {
	get() {
		return process.env.FATIMA_ENV as string;
	},
	set(env: string = "missing_environment") {
		process.env.FATIMA_ENV = env.toLocaleLowerCase();
	},
};
