export const fatimaEnv = {
  get() {
    return process.env.FATIMA_ENV!;
  },
  set(env: string = "missing_environment") {
    process.env.FATIMA_ENV = env.toLocaleLowerCase();
  },
};
