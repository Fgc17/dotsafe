import { DotsafeValidator, UnsafeEnvironmentVariables } from "../types";

export type ZodSchemaMock = {
  safeParse: (env: any) => {
    success: boolean;
    error?: {
      errors: Array<{
        path: (string | number)[];
        message: string;
      }>;
    };
    data?: any;
  };
};

export const zod = (schema: ZodSchemaMock): DotsafeValidator => {
  return (env: UnsafeEnvironmentVariables) => {
    const result = schema.safeParse(env);

    const isValid = result.success;

    const errors = result.error?.errors.map((error) => ({
      key: error.path.join("."),
      message: error.message,
    }));

    return {
      isValid,
      errors,
    };
  };
};
