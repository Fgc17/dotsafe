import { EnvironmentVariables } from "src/types";

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

export const extension = {
  name: "tsenv-trigger-dev",
  onBuildStart: async (context: any) => {
    context.addLayer({
      id: "tsenv-generate",
      commands: [`pnpm tsenv generate`],
    });
  },
};

export const triggerDev = {
  loader,
};
