import typia, { tags } from "typia";
import { dotsafe } from "@dotsafe/dotsafe";
import dotenv from "dotenv";
import { EnvConstraint } from "@/typia/env";

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
