import { config, adapters, validators } from "fatima";
import { EnvConstraint } from "@/typia/env";

import typia, { tags } from "typia";
import dotenv from "dotenv";

type Schema = EnvConstraint<{
  NODE_ENV: string & tags.Format<"email">;
  TZ: string;
}>;

export default config({
  client: {
    publicPrefix: "NEXT_PUBLIC_",
  },
  load: async () => {
    const dotenvVars = adapters.dotenv.load(dotenv);

    return dotenvVars;
  },
  validate: validators.typia((env) => typia.validate<Schema>(env)),
});
