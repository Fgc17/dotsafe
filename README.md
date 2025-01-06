![Alt text](./assets/banner.png "Optional title")

### Works with

<p align="center">
  <a href="https://nestjs.com/" target="blank" style="text-decoration: none;">
    <img src="https://nestjs.com/img/logo-small.svg" width="64" height="64" alt="Nest Logo" />
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
</p>

And (probably) everything that uses environment variables.

### Features

- Full typesafe environment variables
- Built in adapters (infisical and trigger)
- Environment variable in-memory injection
- Typescript configuration file
- Functional or class based client (or injectable).

### Installation

```bash
npm install @ferstack/ts-env
```

```bash
pnpm install @ferstack/ts-env
```

```bash
yarn add @ferstack/ts-env
```

### Quickstart

#### Create configuration file

```typescript
// env.config.ts

import { tsenv } from "@ferstack/ts-env";
import "dotenv/config";

export default tsenv.config({
  loader: async () => process.env,
});
```

> [!TIP]
> For further customization see the advanced usage section

#### Generate the typesafe client

```bash
npm ts-env generate
```

#### Use your environment variables

```typescript
// route.ts
import { env } from "env";
import { NextResponse } from "next/server";

export async function GET() {
  // Full intellisense 👇👇👇
  const port = env.get("PORT");

  return new NextResponse(port);
}
```

#### Package.json script

```jsonc
// package.json
{
  "scripts": {
    "dev": "ts-env run -g -- npm start -w",
    // The `-g` flag updates the client each time
    "postinstall": "ts-env generate",
    // or 'prebuild'
    // the app won't build if the client is not generated
  },
}
```

#### .gitignore

Add the generated client to your `.gitignore` file.

> [!IMPORTANT]  
> Always generate the client in the CI/CD pipeline.

```.gitignore
# .gitignore

env.ts
```

### NestJS and OOP

When using NestJS, ts-env will automatically detect your setup and generate a different client from usual:

```typescript
// env.service.ts
import { Injectable } from "@nestjs/common";
import { lib } from "@ferstack/ts-env";

export type EnvironmentVariables = "";

@Injectable()
export class EnvService {
  get(key: EnvironmentVariables) {
    return lib.env.get(key);
  }

  getNumber(key: EnvironmentVariables) {
    return lib.env.getNumber(key);
  }
}
```

This will be created under `src/env.service.ts`.

#### OOP

If you don't use nest and still want a class based client, just add the `ClientType.OOP` to your configuration file:

```typescript
// env.config.ts

import { tsenv, ClientType } from "@ferstack/ts-env";
import "dotenv/config";

export default tsenv.config({
  ...,
  client: ClientType.OOP,
});
```

### Advanced usage

Anything you return from the loader will be injected into the environment variables, so the loader is fully customizable.

You can also use the default built-in adapters or create your own.

#### Infisical adapter

```typescript
import { InfisicalSDK } from "@infisical/sdk";
import { tsenv, EnvironmentVariables } from "@ferstack/ts-env";
import { config } from "dotenv";

export default tsenv.config({
  loader: async () => {
    const dotenv = config();

    const processEnv = dotenv.parsed as EnvironmentVariables;

    const nodeEnv = processEnv.NODE_ENV as
      | "development"
      | "preview"
      | "production";

    if (nodeEnv === "development") {
      const loader = tsenv.adapters.infisical.loader;

      const config = {
        clientId: processEnv.INFISICAL_CLIENT_ID!,
        clientSecret: processEnv.INFISICAL_CLIENT_SECRET!,
        projectId: processEnv.INFISICAL_PROJECT_ID!,
        environment: "dev",
      };

      const infisicalEnv = loader(InfisicalSDK, config);

      Object.assign(infisicalEnv, processEnv);

      return infisicalEnv;
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

#### Trigger adapter

##### Extension

When deploying to trigger you may not always deploy from your machine, where `env.ts` is already generated. In this case, to avoid build errors, you can use the provided extension:

```typescript
// trigger.config.ts
import { defineConfig } from "@trigger.dev/sdk/v3";
import { tsenv } from "@ferstack/ts-env";

export default defineConfig({
  project: "my-project",
  build: {
    extensions: [tsenv.adapters.triggerDev.extension()],
  },
});
```

##### Loader

```typescript
// env.config.ts
import { tsenv, EnvironmentVariables } from "@ferstack/ts-env";
import { envvars, configure } from "@trigger.dev/sdk/v3";
import { config } from "dotenv";

export default tsenv.config({
  loader: async () => {
    const dotenv = config();

    const processEnv = dotenv.parsed as EnvironmentVariables;

    const nodeEnv = processEnv.NODE_ENV;

    if (nodeEnv === "development") {
      configure({
        accessToken: processEnv.TRIGGER_ACCESS_TOKEN!,
      });

      const loader = tsenv.adapters.triggerDev.loader;

      const config = {
        projectId: processEnv.TRIGGER_PROJECT_ID!,
        environment: "dev",
      };

      const triggerEnv = loader(envvars, config);

      Object.assign(triggerEnv, processEnv);

      return triggerEnv;
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
