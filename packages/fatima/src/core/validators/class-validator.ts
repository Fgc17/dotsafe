import { FatimaValidator, UnsafeEnvironmentVariables } from "../types";

export type ClassValidatorValidateMock = (instance: any) => Promise<
  Array<{
    property: string;
    constraints?: {
      [type: string]: string;
    };
  }>
>;

export type ClassTransformerPlainToInstance = (
  constraint: any,
  object: any
) => any;

export const classValidator = (
  constraint: any,
  helpers: {
    validate: ClassValidatorValidateMock;
    plainToInstance: ClassTransformerPlainToInstance;
  }
): FatimaValidator => {
  return async (env: UnsafeEnvironmentVariables) => {
    const instance = helpers.plainToInstance(constraint, env);

    const classValidatorErrors = await helpers.validate(instance);

    const isValid = classValidatorErrors.length === 0;

    const errors = isValid
      ? undefined
      : classValidatorErrors.flatMap((error) =>
          Object.values(error.constraints ?? {}).map((value) => ({
            key: error.property,
            message: value,
          }))
        );

    return {
      isValid,
      errors,
    };
  };
};
