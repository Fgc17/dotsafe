import { env } from "../env";

export function sum() {
  const value = env.get("API_KEY");

  console.log(value);
}

sum();
