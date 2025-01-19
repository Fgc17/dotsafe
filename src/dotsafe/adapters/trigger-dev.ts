import { resolve } from "path";
import { spawn } from "child_process";
import { getRuntime } from "../utils/get-runtime";
import { UnsafeEnvironmentVariables } from "../types";

type TriggerDevClientMock = {
  list: (
    projectId: string,
    environment: string
  ) => Promise<
    Array<{
      name: string;
      value: string;
    }>
  >;
};

const loader = async (
  envvars: TriggerDevClientMock,
  env: {
    projectId: string;
    environment?: string;
  }
) => {
  const secrets = await envvars.list(env.projectId, env.environment ?? "dev");

  return secrets.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as UnsafeEnvironmentVariables);
};

type TriggerDevPluginMock = {
  name: string;
  setup: (build: { onStart: (callback: () => void) => void }) => void;
};

type TriggerDevBuildContextMock = {
  registerPlugin: (plugin: TriggerDevPluginMock) => void;
  target: string;
};

type TriggerDevExtensionMock = {
  name: string;
  onBuildStart: (context: TriggerDevBuildContextMock) => void;
};

export const extension = (config?: string): TriggerDevExtensionMock => ({
  name: "dotsafe-trigger-dev",
  onBuildStart(context) {
    if (context.target === "dev") return;

    context.registerPlugin({
      name: "dotsafe-trigger-dev",
      async setup(build: any) {
        build.onStart(async () => {
          const runtime = getRuntime();

          const cmdPath = resolve(
            process.cwd(),
            "node_modules/dotsafe/dist/cmd.cjs"
          );

          await new Promise<void>((resolve, reject) => {
            const child = spawn(
              runtime,
              [cmdPath, "generate", config ? `--config=${config}` : ""],
              {
                shell: true,
                stdio: "inherit",
              }
            );

            child.on("error", (error) => {
              console.error(`Error: ${error.message}`);
              reject(error);
            });

            child.on("close", (code) => {
              if (code !== 0) {
                console.error(`Command exited with code ${code}`);
                reject(new Error(`Command exited with code ${code}`));
              } else {
                resolve();
              }
            });
          });
        });
      },
    });
  },
});

export const triggerDev = {
  loader,
  extension,
};
