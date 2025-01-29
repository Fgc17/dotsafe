import { UnsafeEnvironmentVariables } from "../types";
import { GenericClass } from "../utils/types";

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

const load = async (
  infisicalClient: InfisicalClientMock,
  env: {
    clientId: string;
    clientSecret: string;
    projectId: string;
    environment: string;
  } = {
    clientId: process.env.INFISICAL_CLIENT_ID!,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET!,
    projectId: process.env.INFISICAL_PROJECT_ID!,
    environment: "dev",
  }
): Promise<UnsafeEnvironmentVariables> => {
  const client = new infisicalClient();

  await client.auth().universalAuth.login({
    clientId: env.clientId!,
    clientSecret: env.clientSecret!,
  });

  const { secrets } = await client.secrets().listSecrets({
    environment: env.environment,
    projectId: env.projectId!,
  });

  return secrets.reduce((acc, { secretKey, secretValue }) => {
    acc[secretKey] = secretValue;
    return acc;
  }, {} as UnsafeEnvironmentVariables);
};

export const infisical = {
  load,
};
