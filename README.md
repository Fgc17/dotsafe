![Alt text](./assets/banner.png "Optional title")

### Features

- Full typesafe environment variables
- Built in environment loaders (infisical only, by now)
- Environment variable in-memory injection
- Typescript configuration file

### Installation

```bash
npm install ts-env
```

### Quickstart

#### Create configuration file

```typescript
// env.config.ts

import { tsenv } from "ts-env";
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

#### Custom loaders

Anything you return from the loader will be injected into the environment variables.

```typescript
{
  loader: async () => {
    const nodeEnv = process.env.NODE_ENV as
      | "development"
      | "preview"
      | "production";

    const processEnv = process.env as EnvironmentVariables;

    if (nodeEnv === "development") {
      const config = {
        clientId: processEnv.INFISICAL_CLIENT_ID!,
        clientSecret: processEnv.INFISICAL_CLIENT_SECRET!,
        projectId: processEnv.INFISICAL_PROJECT_ID!,
        environment: "dev",
      };

      return loader(infisicalEnv, config);
    }

    if (nodeEnv === "preview") {
      return processEnv;
    }

    if (nodeEnv === "production") {
      return processEnv;
    }
  },
}
```
