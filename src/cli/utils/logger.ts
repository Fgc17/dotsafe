import chalk from "chalk";

const error = (error: any, message: string) => {
  console.error(error);
  console.log(chalk.bgRed("🔒 [ts-env] Error: " + message));
};

const info = (message: string) => {
  console.log(chalk.bgBlue("🔒 [ts-env] " + message));
};

const success = (message: string) => {
  console.log(chalk.bgHex("#052e16").hex("#22c55e")("🔒 [ts-env] " + message));
};

export const logger = {
  error,
  info,
  success,
};
