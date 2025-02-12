import { config, adapters, validators } from "fatima";

import dotenv from "dotenv";
import { z } from "zod";

const constraint = z.object({
	NODE_ENV: z.string(),
});

export default config({
	client: {
		publicPrefix: "NEXT_PUBLIC_",
	},
	load: {
		development: [adapters.dotenv.load(dotenv)],
	},
	validate: validators.zod(constraint),
	environment: (processEnv) => processEnv.NODE_ENV ?? "development",
});
