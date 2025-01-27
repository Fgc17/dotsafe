import { UnsafeEnvironmentVariables } from "../types";

type ZodObjectMock = {
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

export const zod = (schema: ZodObjectMock) => {
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
