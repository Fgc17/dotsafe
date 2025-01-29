import typia, { tags } from "typia";
import { dotsafe } from "@dotsafe/dotsafe";
import dotenv from "dotenv";
import { EnvConstraint } from "playground/env";

import { type } from "arktype";

const schema = type({
  name: "string",
  platform: "'android' | 'ios'",
  "versions?": "(number | string)[]",
});

const out = schema({
  name: "Alan Turing",
  device: {
    platform: "enigma",
    versions: [0, "1", 0n],
  },
});

type Schema = EnvConstraint<{
  NODE_ENV: string & tags.Format<"email">;
  TZ: string;
}>;

export default dotsafe.config({
  client: {
    publicPrefix: "NEXT_PUBLIC_",
  },
  load: async () => {
    const dotenvVars = dotsafe.adapters.dotenv.load(dotenv);

    return dotenvVars;
  },
  validate: dotsafe.validators.typia((env) => typia.validate<Schema>(env)),
});

/**
 * 
import typia, { tags } from "typia";
import { dotsafe } from "@dotsafe/dotsafe";
import dotenv from "dotenv";

interface Schema {
  id: string & tags.Format<"uuid">;
  email: string & tags.Format<"email">;
  age: number &
    tags.Type<"uint32"> &
    tags.ExclusiveMinimum<19> &
    tags.Maximum<100>;
}

export default dotsafe.config({
  client: {
    publicPrefix: "NEXT_PUBLIC_",
  },
  load: async () => {
    const dotenvVars = dotsafe.adapters.dotenv.load(dotenv);

    return dotenvVars;
  },
  validate: dotsafe.validators.typia((env) => typia.validate<Schema>(env)),
});
 */
