import { DotsafeValidator } from "../types";

export type ClassValidatorValidateMock = (instance: any) => Array<{
  property: string;
  constraints?: {
    [type: string]: string;
  };
}>;

export type ClassTransformerPlainToInstance = (schema: any, object: any) => any;

export const classValidator = (
  schema: any,
  helpers: {
    validate: ClassValidatorValidateMock;
    plainToInstance: ClassTransformerPlainToInstance;
  }
): DotsafeValidator => {
  return (env: any) => {
    const instance = helpers.plainToInstance(schema, env);

    const classValidatorErrors = helpers.validate(instance);

    const isValid = classValidatorErrors.length === 0;

    const errors = isValid
      ? classValidatorErrors.flatMap((error) =>
          Object.values(error.constraints ?? {}).map((value) => ({
            key: error.property,
            message: value,
          }))
        )
      : undefined;

    return {
      isValid,
      errors,
    };
  };
};
