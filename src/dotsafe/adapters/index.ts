import { dotenv } from "./dotenv";
import { infisical } from "./infisical";
import { triggerDev } from "./trigger-dev";
import { vercel } from "./vercel";

export const adapters = {
  infisical,
  triggerDev,
  vercel,
  dotenv,
};
