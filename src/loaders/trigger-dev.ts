import { EnvironmentVariables } from "src/types";

export type TriggerDevClientMock = {
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

export const triggerDev = async (
  triggerDevClient: TriggerDevClientMock,
  env: {
    projectId: string;
    environment: string;
  }
) => {
  const secrets = await triggerDevClient.list(env.projectId, env.environment);

  return secrets.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as EnvironmentVariables);
};
