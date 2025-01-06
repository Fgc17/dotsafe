import { EnvironmentVariables, GenericClass } from "../types";

type InfisicalClientMock = GenericClass<{
  auth: () => {
    universalAuth: {
      login: (args: { clientId: string; clientSecret: string }) => Promise<any>;
    };
  };
  secrets: () => {
    listSecrets: (args: { environment: string; projectId: string }) => Promise<{
      secrets: Array<{
        secretKey: string;
        secretValue: string;
      }>;
    }>;
  };
}>;

const loader = async (
  infisicalClient: InfisicalClientMock,
  env: {
    clientId: string;
    clientSecret: string;
    projectId: string;
    environment?: string;
  }
): Promise<EnvironmentVariables> => {
  const client = new infisicalClient();

  await client.auth().universalAuth.login({
    clientId: env.clientId!,
    clientSecret: env.clientSecret!,
  });

  const { secrets } = await client.secrets().listSecrets({
    environment: env.environment ?? "dev",
    projectId: env.projectId!,
  });

  return secrets.reduce((acc, { secretKey, secretValue }) => {
    acc[secretKey] = secretValue;
    return acc;
  }, {} as EnvironmentVariables);
};

export const infisical = {
  loader,
};
