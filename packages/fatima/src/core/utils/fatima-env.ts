export const fatimaEnv = {
  get() {
    return process.env.FATIMA_ENV!;
  },
  set(env: string) {
    process.env.FATIMA_ENV = env.toLocaleLowerCase();
  },
};
