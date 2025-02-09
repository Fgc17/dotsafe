const { createEnv } = require("fatima/env");

/** @typedef {Object} EnvKeys
 * @property {string} NEXT_PUBLIC_API_URL
 * @property {string} NODE_ENV
 * @property {string} TZ
 */

/** @typedef {Object} Constraint
 * @property {any} NEXT_PUBLIC_API_URL
 * @property {any} NODE_ENV
 * @property {any} TZ
 */

/** @type {import('fatima/env').ServerEnvRecord<keyof EnvKeys, undefined>} */
exports.env = createEnv({ isServer: undefined });
