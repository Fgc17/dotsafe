import { config, adapters, validators } from "fatima";
import { z, type ZodType } from "zod";
import dotenv from "dotenv";

import type { EnvRecord } from "./env";

type Constraint = Partial<EnvRecord<ZodType>>;

const constraint = {
	NODE_ENV: z.string(),
} satisfies Constraint;

export default config({
	client: {
		publicPrefix: "NEXT_PUBLIC_",
	},
	load: {
		development: [adapters.dotenv.load(dotenv)],
	},
	validate: validators.zod(z.object(constraint)),
	environment: (processEnv) => processEnv.NODE_ENV ?? "development",
});
