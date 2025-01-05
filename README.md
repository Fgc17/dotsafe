![Alt text](./assets/banner.png "Optional title")

### Features

- Full typesafe environment variables
- Built in environment loaders (infisical only, by now)
- Environment variable in-memory injection
- Typescript configuration file

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
  // For further customization see the advance usage section
  loader: async () => process.env,
});
```

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

### Advance usage

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
