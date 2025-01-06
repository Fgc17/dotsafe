export function check(key: string) {
  try {
    const env = process.env[key];

    if (!env) {
      throw new Error(`Environment variable ${key} is not set`);
    }
  } catch (err) {
    console.log(err);

    if (!process.env.TS_ENV) {
      console.log(
        "\x1b[41m",
        "🔒 [ts-env] You did not inject your variables into your process with `ts-env run -g -- 'your-command'`, this is likely why this is happening.",
        "\x1b[0m"
      );
    }

    throw "";
  }
}

export function get(key: string) {
  check(key);

  return process.env[key];
}

export function getNumber(key: string) {
  const value = get(key);
  const parsed = Number(value);

  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} is not a number`);
  }

  return parsed;
}
