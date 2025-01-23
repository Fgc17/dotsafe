import { UnsafeEnvironmentVariables } from "src/dotsafe/types";

interface CreateEnvOptions {
  isServer?: () => boolean;
}

interface CreatePublicEnvOptions {
  publicPrefix: string;
  publicVariables: UnsafeEnvironmentVariables;
}

export type EnvRecord<Keys extends string, Prefix extends string> = {
  [K in Keys as K extends `${Prefix}${string}` ? never : K]: string;
};

export type PublicEnvRecord<Keys extends string, Prefix extends string> = {
  [K in Keys as K extends `${Prefix}${string}` ? K : never]: string;
};

export const createEnv = (options: CreateEnvOptions) => {
  const isServer = options.isServer || (() => typeof window === "undefined");

  const isAccessForbidden = () => !isServer();

  const isUndefined = (key: string) => {
    if (!process.env[key]) {
      return true;
    }
  };

  const handleUndefined = (key: string) => {
    if (!process.env.TS_ENV) {
      console.log(
        "\x1b[41m",
        `🔒 [dotsafe] Environment variable ${key} not found.`,
        "If you are expecting dotsafe to inject your private envs, check the process start script, it should look like: `dotsafe run -g -- 'your-command'`.",
        "\x1b[0m"
      );
    }

    throw new Error(`🔒 [dotsafe] Environment variable ${key} not found.`);
  };

  const handleForbiddenAccess = (key: string) => {
    throw new Error(
      [
        `🔒 [dotsafe] Environment variable ${key} not allowed on the client, here are some possible fixes:`,
        `\n 1. Add the public prefix to your variable if you want to expose it to the client.`,
        `\n 2. Check if your public prefix is correct by assigning 'env.publicPrefix' to your dotsafe configuration.`,
      ].join("\n")
    );
  };

  const dotsafeEnv = new Proxy(process.env, {
    get(target, key: string) {
      if (isAccessForbidden()) {
        handleForbiddenAccess(key);
      }

      if (isUndefined(key)) {
        handleUndefined(key);
      }

      return Reflect.get(target, key);
    },
  });

  return dotsafeEnv as any;
};

export const createPublicEnv = (options: CreatePublicEnvOptions) => {
  const isUndefined = (key: string) => {
    if (!options.publicVariables[key]) {
      return true;
    }
  };

  const handleUndefined = (key: string) => {
    throw new Error(`🔒 [dotsafe] Environment variable ${key} not found.`);
  };

  const dotsafePublicEnv = new Proxy(options.publicVariables, {
    get(target, key: string) {
      if (isUndefined(key)) {
        handleUndefined(key);
      }

      return Reflect.get(target, key);
    },
  });

  return dotsafePublicEnv as any;
};
