import { EnvironmentVariables } from "src/types";
import { generateAction } from "src/cli/actions/generate";
import { getActionArgs } from "src/cli/utils/get-action-args";

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
    environment: string;
  }
) => {
  const secrets = await envvars.list(env.projectId, env.environment);

  return secrets.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as EnvironmentVariables);
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
  name: "tsenv-trigger-dev",
  onBuildStart(context) {
    if (context.target === "dev") return;

    context.registerPlugin({
      name: "tsenv-trigger-dev",
      async setup(build: any) {
        build.onStart(async () => {
          const actionArgs = await getActionArgs({
            config,
          });

          await generateAction(actionArgs);
        });
      },
    });
  },
});

export const triggerDev = {
  loader,
  extension,
};
