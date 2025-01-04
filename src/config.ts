import { TSEnvLoader } from "./types";

export type TSEnvConfig = {
  loader: TSEnvLoader;
  generate?: "declaration" | "client" | "both";
};

export function config({ generate = "client", loader }: TSEnvConfig) {
  return {
    generate,
    loader,
  };
}
