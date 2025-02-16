import { config, adapters, validators } from "fatima";
import type { EnvType } from "@/typia/env";
import typia, { type tags } from "typia";
import dotenv from "dotenv";

type Constraint = EnvType<{
	NODE_ENV: string;
}>;

export default config({
	client: {
		publicPrefix: "NEXT_PUBLIC_",
	},
	load: {
		development: [adapters.dotenv.load(dotenv)],
	},
	validate: validators.typia((env) => typia.validate<Constraint>(env)),
	environment: (processEnv) => processEnv.NODE_ENV ?? "development",
});
