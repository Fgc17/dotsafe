type EnvironmentVariables = "API_URL" | "API_KEY"

const get = (key: EnvironmentVariables) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return process.env[key];
};

const getNumber = (key: EnvironmentVariables) => {
  const value = get(key);
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} is not a number`);
  }
  return parsed;
};

export const env = {
  get,
  getNumber,
};