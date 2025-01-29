import { spawn } from "child_process";
import { logger } from "../utils/logger";
import { getConfig } from "../utils/get-config";
import { getEnv } from "../utils/get-env";
import { UnsafeEnvironmentVariables } from "src/dotsafe/types";
import { debounce } from "../utils/debounce";
import { createClient } from "../utils/create-client";
import { populateProcessEnv } from "../utils/assign-env";

import path from "path";
import fs from "fs";
import http from "http";

export async function devAction(
  options: { config: string; generate: boolean; port: boolean },
  args: string[]
) {
  const config = await getConfig(options.config);

  const { env, envCount } = await getEnv(config);

  createClient(config, env);

  logger.success(`Loaded ${envCount} environment variables`);

  populateProcessEnv(env);

  const cmd = args.shift();

  const child = spawn(cmd!, [...args], {
    env: process.env,
    shell: true,
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  const envFilesDir = path.dirname(config.path);

  const watcher = fs.watch(
    envFilesDir,
    debounce(async (_, filename) => {
      if (
        !filename ||
        !filename.endsWith(".env") ||
        filename === ".example.env"
      )
        return;

      const { env, envCount } = await getEnv(config);

      createClient(config, env);

      populateProcessEnv(env);

      child.send({ type: "update-env", env });

      logger.success(`Reloaded ${envCount} environment variables`);
    }, 100)
  );

  if (options.port) {
    const server = http.createServer((req, res) => {
      if (req.url != "/dotsafe") {
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
          const { env, envCount } = await getEnv(config);

          createClient(config, env);

          populateProcessEnv(env);

          child.send({ type: "update-env", env });

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
          JSON.stringify({ status: "error", message: "Internal Server Error" })
        );
      });
    });

    const PORT = options.port;

    server.listen(PORT, () => {
      logger.success(
        `Development webhook is listening on port ${PORT} for POST /dotsafe requests.`
      );
    });
  }

  child.on(
    "message",
    (message: { type: string; env: UnsafeEnvironmentVariables }) => {
      if (message.type === "update-env") {
        populateProcessEnv(message.env);
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
}
