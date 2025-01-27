import { config } from "./config";
import { adapters } from "./adapters";
import { validators } from "./validators";
export * from "./types";

const dotsafe = {
  config,
  validators,
  adapters,
};

export { dotsafe };
