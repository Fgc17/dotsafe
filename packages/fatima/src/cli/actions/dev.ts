import { ChildProcess, spawn } from "child_process";
import { logger } from "../../core/utils/logger";
import { transpileConfig } from "../utils/transpile-config";
import { loadEnv } from "../utils/load-env";
import { UnsafeEnvironmentVariables } from "src/core/types";
import { debounce } from "../utils/debounce";
import { createClient } from "../utils/create-client";
import { createInjectableEnv } from "../utils/env-patch";

import fs from "fs";
import http from "http";
import { fatimaEnv } from "src/core/utils/fatima-env";

type ActionOptions = {
  config: string;
  generate: boolean;
  lite: boolean;
};

const environmentBlacklist = [
  "production",
  "prod",
  "staging",
  "stg",
  "preview",
  "pre",
  "prev",
  "preprod",
];

export const devAction = async (options: ActionOptions, args: string[]) => {
  const config = await transpileConfig(options.config);

  const environment = fatimaEnv.get();

  if (environmentBlacklist.includes(environment)) {
    logger.error(
      `Your 'config.environment()' function returned '${environment}', you can't run 'fatima dev' in this environment.`
    );
    process.exit(1);
  }

  const { env, envCount } = await loadEnv(config);

  if (!options.lite) {
    createClient(config, env);
  }

  logger.success(`Loaded ${envCount} environment variables`);

  const injectableEnv = createInjectableEnv(env);

  const cmd = args.shift();

  const child = spawn(cmd!, [...args], {
    env: injectableEnv,
    shell: true,
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  const envFilesDir = config.file.folderPath;

  const updateChildEnv = (
    child: ChildProcess,
    env: UnsafeEnvironmentVariables
  ) => {
    child.send({ type: "update-env", env });
  };

  const watcher = fs.watch(
    envFilesDir,
    debounce(async (_, filename) => {
      if (
        !filename ||
        !filename.endsWith(".env") ||
        filename === ".example.env"
      )
        return;

      const { env, envCount } = await loadEnv(config);

      if (!options.lite) {
        createClient(config, env);
      }

      const injectableEnv = createInjectableEnv(env);

      updateChildEnv(child, injectableEnv);

      logger.success(`Reloaded ${envCount} environment variables`);
    }, 100)
  );

  if (config.hook?.port) {
    const server = http.createServer((req, res) => {
      if (req.url != "/fatima") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "not found" }));
        return;
      }

      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const { env, envCount } = await loadEnv(config);

          if (!options.lite) {
            createClient(config, env);
          }

          const injectableEnv = createInjectableEnv(env);

          updateChildEnv(child, injectableEnv);

          logger.success(`Reloaded ${envCount} environment variables`);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "success" }));
        } catch (error: any) {
          logger.error("Error processing webhook:", error);

          res.writeHead(400, { "Content-Type": "application/json" });

          res.end(JSON.stringify({ status: "error", message: error.message }));
        }
      });

      req.on("error", (err: any) => {
        logger.error("Request error:", err);

        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "error",
            message: "Internal Server Error",
          })
        );
      });
    });

    const PORT = config.hook.port;

    server.listen(PORT, () => {
      logger.success(
        `Development webhook is listening on port ${PORT} for POST /fatima requests.`
      );
    });
  }

  child.on(
    "message",
    (message: { type: string; env: UnsafeEnvironmentVariables }) => {
      if (message.type === "update-env") {
        const injectableEnv = createInjectableEnv(message.env);

        Object.assign(process.env, injectableEnv);
      }
    }
  );

  child.on("error", (error) => {
    console.error(`Error: ${error.message}`);
    watcher.close();
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`Command exited with code ${code}`);
      watcher.close();
      process.exit(code!);
    }
  });
};
