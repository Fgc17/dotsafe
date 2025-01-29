import chalk from "chalk";

const line = (message: string[]) =>
  "\n" + "🔒 [fatima] " + message.join(" ") + "\n";

const error = (...message: string[]) => {
  console.log(chalk.bgHex("#2e0a05").hex("c52222")(line(message)));
};

const info = (...message: string[]) => {
  console.log(chalk.bgBlue(line(message)));
};

const success = (...message: string[]) => {
  console.log(chalk.bgHex("#052e16").hex("#22c55e")(line(message)));
};

export const logger = {
  error,
  info,
  success,
};
