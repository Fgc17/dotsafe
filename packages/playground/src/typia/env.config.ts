import { config, adapters, validators } from "fatima";
import { EnvType } from "@/typia/env";

import typia, { tags } from "typia";
import dotenv from "dotenv";

type Constraint = EnvType<{
	NODE_ENV: string & tags.Format<"email">;
	TZ: string;
}>;

export default config({
	client: {
		publicPrefix: "NEXT_PUBLIC_",
	},
	load: {
		development: [adapters.dotenv.load(dotenv)],
	},
	validate: validators.typia((env) => typia.validate<Constraint>(env)),
});
