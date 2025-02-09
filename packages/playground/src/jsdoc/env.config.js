const dotenv = require("dotenv");
const { config, adapters, validators } = require("fatima");
const { z } = require("zod");

// This JSDoc comment will make sure that your constraint is typesafe
/**
 * @type {import('#env').Constraint}
 */
const constraint = {
	NODE_ENV: z.string(),
	TZ: z.string(),
	NEXT_PUBLIC_API_URL: z.string(),
};

module.exports = config({
	load: {
		development: [adapters.dotenv.load(dotenv)],
	},
	validate: validators.zod(z.object(constraint)),
});
