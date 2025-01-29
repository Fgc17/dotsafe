import { config } from "./config";
import { adapters } from "./adapters";
import { validators } from "./validators";
import { linter } from "./linter";
export * from "./types";

const dotsafe = {
  config,
  validators,
  adapters,
  linter,
};

export { dotsafe };
