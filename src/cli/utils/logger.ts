import chalk from "chalk";

const line = (message: string) => "\n" + "🔒 [ts-env] " + message + "\n";

const error = (error: any, message: string) => {
  console.error(error);
  console.log(chalk.bgRed(line(message)));
};

const info = (message: string) => {
  console.log(chalk.bgBlue(line(message)));
};

const success = (message: string) => {
  console.log(chalk.bgHex("#052e16").hex("#22c55e")(line(message)));
};

export const logger = {
  error,
  info,
  success,
};
