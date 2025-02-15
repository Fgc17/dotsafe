import { config } from "fatima";
import type { FatimaValidationResult } from "fatima";

type Environment = "development" | "staging" | "production";

export default config<Environment>({
  load: {
    development: [
      async () => {
        const fetch = async () => {
          return { NODE_ENV: "development" };
        };
        return await fetch();
      },
    ],
  },
  validate: async (processEnv) => {
    const validation = {
      isValid: true,
      errors: [],
    } as FatimaValidationResult;
    if (!processEnv.NODE_ENV) {
      validation.errors.push({
        key: "NODE_ENV",
        message: "NODE_ENV is required",
      });
    }
    if (validation.errors.length) {
      validation.isValid = false;
    }
    return validation;
  },
  environment: (processEnv) => processEnv.NODE_ENV ?? "development",
});
