[![Alt text](./assets/banner.png "Optional title")](https://soonheresomething.vercel.app)

## Works with

<p align="center">
  <a href="https://nextjs.org" target="blank">
    <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" width="64" height="64" alt="Next.js Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://https://trpc.io/" target="blank">
    <img src="https://avatars.githubusercontent.com/u/78011399?s=200&v=4" width="64" height="64" alt="Trpc Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://trigger.dev/" target="blank">
    <img src="https://avatars.githubusercontent.com/u/95297378?s=200&v=4" width="64" height="64" alt="Trigger.dev Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://nestjs.com/" target="blank" style="text-decoration: none;">
    <img src="https://nestjs.com/img/logo-small.svg" width="64" height="64" alt="Nest Logo" />
  </a>
</p>

And (probably) everything that uses environment variables.

## Table of Contents

- [Works with](#works-with)
- [Differences from t3-env](#differences-from-t3-env)
- [Features](#features)
- [Installation](#installation)
- [Quickstart](#quickstart)
  - [Create configuration file](#create-configuration-file)
  - [Generate the typesafe client](#generate-the-typesafe-client)
  - [Client Alias](#client-alias)
  - [Use your environment variables](#use-your-environment-variables)
  - [Running your development script](#running-your-development-script)
    - [.gitignore](#gitignore)
- [Variable Validation](#variable-validation)
  - [Defining the validator](#defining-the-validator)
  - [Validating](#validating)
- [Server and Client (SSR stuff)](#server-and-client-ssr-stuff)
  - [Linter](#linter)
- [Loader Adapters](#secret-managers)
  - [Vercel adapter](#vercel-adapter)
  - [Infisical adapter](#infisical-adapter)
  - [Trigger adapter](#trigger-adapter)
    - [Extension](#extension)
    - [Loader](#loader)
- [Remote environment reloading](#remote-environment-reloading)

## Differences from t3-env

See [Thoughts about environment variables and why I built emv.ts](./docs/thoughts.md)

## Features

- Typesafe environment variables
- Agnostic validation (zod, typia, valibot, class-validator, whatever)
- Built-in adapters for loading environments from cloud
- Environments from the cloud directly into process.env
- Typescript configuration file

## Installation

```bash
npm install fatima
```

```bash
pnpm install fatima
```

```bash
yarn add fatima
```

## Quickstart

### Create configuration file

```typescript
// env.config.ts

import { config, adapters } from "fatima";

import dotenv from "dotenv";

export default config({
  loader: async () => adapters.dotenv.load(dotenv),
});
```

> [!TIP]
> For loading from the cloud, see: [Custom Loaders](#custom-loaders)

### Generate the typesafe client

```bash
npm fatima generate
```

### Client Alias

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "env": ["./env.ts"],
    },
  },
}
```

### Use your environment variables

```typescript
// route.ts
import { env } from "env";
import { NextResponse } from "next/server";

export async function GET() {
  // Full intellisense 👇
  const port = env.PORT;

  return new NextResponse(port);
}
```

### Running your development script

This will load, generate and inject variables into the script process.env:

```jsonc
// package.json
{
  "scripts": {
    "dev": "fatima dev -- npm start -w",
  },
}
```

It will also watch for changes in `.env` files (excluding `.example.env`).

> [!TIP]
> You can also watch for changes in your cloud secret-manager, see [remote environment reloading](#remote-environment-reloading)

#### .gitignore

> [!IMPORTANT]  
> You should gitignore your env.ts and always generate it before building/installing.

```.gitignore
# .gitignore

env.ts
```

## Variable Validation

### Defining the validator

> [!TIP]
> Generate the client before starting to write validation, the generated types will make it easier to define the schema.

Here is an example using built-in validator for `zod`:

```typescript
// env.config.ts
import { config, validators } from "fatima";
import { EnvKeys } from "env";
import { z, ZodType } from "zod";

import "dotenv/config";

type ZodEnv = {
  [key in EnvironmentVariables]: ZodType;
};

const schema = z.object<Partial<ZodEnv>>({
  VERY_SECRET_DB_URL: z.string().regex("VERY_PUBLIC_DB_REGEX"),
});

export default config({
  loader: async () => process.env,
  validate: validators.zod(schema),
});
```

You can also define the validator by yourself:

```typescript
// env.config.ts

export default config({
  validate: (env) => {
    const result = schema.safeParse(env);

    const isValid = result.success;

    const errors = result.error?.errors.map((error) => ({
      key: error.path.join("."),
      message: error.message,
    }));

    return {
      isValid,
      errors,
    };
  },
});
```

### Validating

The validation happens with a simple command call:

```bash
npm fatima validate
```

You can include this in your CI/CD pipeline to ensure that the environment variables are always correct before deploying.

## Server and Client (SSR stuff)

First, setup your public prefix, let's say you are using Next.js, so it will be `NEXT_PUBLIC_`:

```typescript
// env.config.ts
import { config } from "fatima";

export default config({
  loader: async ({ processEnv }) => processEnv,
  client: {
    publicPrefix: "NEXT_PUBLIC_",
  },
});
```

From now on, if any variable is correctly prefixed, you will get a `publicEnv` object.

Server environments won't be listed under the `publicEnv` object, and you will get warned if you try to access them in the client.

You can configure the client/server environment detection by setting the `isServer` property in the configuration file:

```typescript
// env.config.ts
import { config } from "fatima";

export default config({
  loader: async ({ processEnv }) => processEnv,
  client: {
    publicPrefix: "NEXT_PUBLIC_",
    isServer: () => typeof window === "undefined",
  },
});
```

### Linter

```typescript
// eslint.config.ts
import { linter as fatima } from "fatima";

export default [
  fatima.eslint.noEnvPlugin,
  fatima.eslint.noEnvRule("**/*.tsx", "**/*.jsx"),
];
```

This will stop you from acessing the server environment object inside ".tsx" and ".jx" files, you can customize it the way you want, as long as you use glob patterns.

> [!CAUTION]
> Although this rule helps, there's no actual way of completely stopping you from accessing the server variables on the server and passing them to the client via HTML or props. Be careful with sensitive data.

## Secret Managers

The loader function is fully customizable, so you can load secrets from any source you want.

### Vercel adapter

This works by programatically running the
[Vercel CLI](https://vercel.com/docs/cli), make sure you have it installed.

You will get a descriptive error/guide if anything goes wrong, so just try it out.

```typescript
import { config, adapters } from "fatima";

import dotenv from "dotenv";

export default config({
  loader: async ({ processEnv }) => {
    const nodeEnv = processEnv.NODE_ENV;

    if (nodeEnv === "development") {
      const dotenvVars = adapters.dotenv.load(dotenv);

      const load = adapters.vercel.load;

      const vercelEnv = load({
        parser: dotenv.parse,
      });

      return {
        ...vercelEnv,
        ...dotenvVars,
      };
    }

    if (nodeEnv === "preview") {
      return processEnv;
    }

    if (nodeEnv === "production") {
      return processEnv;
    }
  },
});
```

### Infisical adapter

```typescript
import { InfisicalSDK } from "@infisical/sdk";
import { config, adapters } from "fatima";

import dotenv from "dotenv";

export default config({
  loader: async ({ processEnv }) => {
    const nodeEnv = processEnv.NODE_ENV;

    if (nodeEnv === "development") {
      const dotenvVars = adapters.dotenv.load(dotenv);

      const load = adapters.infisical.load;

      const infisicalEnv = load(InfisicalSDK, {
        // here or in .env prefixed with INFISICAL_
      });

      return {
        ...infisicalEnv,
        ...dotenvVars,
      };
    }

    if (nodeEnv === "preview") {
      return processEnv;
    }

    if (nodeEnv === "production") {
      return processEnv;
    }
  },
});
```

### Trigger adapter

#### Extension

When deploying to trigger you may not always deploy from your machine, where `env.ts` is already generated. In this case, to avoid build errors, you can use the provided extension:

```typescript
// trigger.config.ts
import { defineConfig } from "@trigger.dev/sdk/v3";
import { adapters } from "fatima";

export default defineConfig({
  project: "my-project",
  build: {
    extensions: [adapters.triggerDev.extension()],
  },
});
```

#### Loader

```typescript
// env.config.ts
import { config, adapters, EnvironmentVariables } from "fatima";
import * as trigger from "@trigger.dev/sdk/v3";

import dotenv from "dotenv";

export default config({
  loader: async ({ processEnv }) => {
    const nodeEnv = processEnv.NODE_ENV;

    if (nodeEnv === "development") {
      const dotenvVars = adapters.dotenv.load(dotenv);

      const load = adapters.triggerDev.load;

      const triggerEnv = load(trigger, {
        // here or in .env prefixed with TRIGGER_
      });

      return {
        ...triggerEnv,
        ...dotenvVars,
      };
    }

    if (nodeEnv === "preview" || nodeEnv === "staging") {
      return processEnv;
    }

    if (nodeEnv === "production") {
      return processEnv;
    }
  },
});
```

## Remote environment reloading

You can specify a port option to your dev script:

```jsonc
// package.json
{
  "scripts": {
    "dev": "fatima dev --port 9000 -- npm start -w",
  },
}
```

This will spin up a localhost server with the **/fatima** endpoint (all http methods accepted).

Any requests made to that url will reload the types and re-inject the changes into your process, no need to restart your server.

You will need a tunneling solution for exposing your local environment to the world, if you are new to tunneling, check out the npm package [localtunnel](https://github.com/localtunnel/localtunnel).

After that, just setup your webhook in your secret-manger using the url that you got from the tunneling tool.
