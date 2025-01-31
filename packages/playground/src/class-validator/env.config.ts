import "reflect-metadata";
import dotenv from "dotenv";
import { config, adapters, validators } from "fatima";
import { IsEmail, IsTimeZone, validate } from "class-validator";
import { plainToInstance } from "class-transformer";

import { EnvClass } from "./env";

class Constraint implements Partial<EnvClass> {
  @IsEmail()
  NODE_ENV: string;

  @IsTimeZone()
  TZ?: string | undefined;
}

export default config({
  client: {
    publicPrefix: "NEST_PUBLIC",
  },
  load: {
    development: [adapters.dotenv.load(dotenv)],
  },
  validate: validators.classValidator(Constraint, {
    plainToInstance,
    validate,
  }),
});
