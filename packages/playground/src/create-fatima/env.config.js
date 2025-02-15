const { config } = require("fatima");
const { adapters } = require("fatima");
const dotenv = require("dotenv");
const { validators } = require("fatima");
const { z } = require("zod");

/**
 * @type {import('#env').Constraint}
 */
const constraint = {
  NODE_ENV: z.enum(["development"]),
};

module.exports = config({
  load: {
    development: [adapters.dotenv.load(dotenv)],
  },
  validate: validators.zod(z.object(constraint)),
  environment: (processEnv) => processEnv.NODE_ENV ?? "development",
});
