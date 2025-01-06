import { ClientType } from "src/tsenv/types";

const functionalClient = [
  'import { lib } from "@ferstack/ts-env";',
  "",

  "export type EnvironmentVariables = '';",
  "",

  "const get = (key: EnvironmentVariables) => {",
  "  return lib.env.get(key);",
  "};",
  "",

  "const getNumber = (key: EnvironmentVariables) => {",
  "  return lib.env.getNumber(key);",
  "};",
  "",

  "export const env = {",
  "  get,",
  "  getNumber,",
  "};",
];

const oopClient = [
  'import { lib } from "@ferstack/ts-env";',
  "",

  "export type EnvironmentVariables = '';",
  "",

  "export class EnvService {",
  "  get(key: EnvironmentVariables) {",
  "    return lib.env.get(key);",
  "  }",
  "",

  "  getNumber(key: EnvironmentVariables) {",
  "    return lib.env.getNumber(key);",
  "  }",
  "}",
];

const nestjsClient = [
  "import { Injectable } from '@nestjs/common';",
  'import { lib } from "@ferstack/ts-env";',
  "",

  "export type EnvironmentVariables = '';",
  "",

  "@Injectable()",
  "export class EnvService {",
  "  get(key: EnvironmentVariables) {",
  "    return lib.env.get(key);",
  "  }",
  "",

  "  getNumber(key: EnvironmentVariables) {",
  "    return lib.env.getNumber(key);",
  "  }",
  "}",
];

export function createClient(type: ClientType, path?: string) {
  const clients = {
    [ClientType.Functional]: functionalClient,
    [ClientType.OOP]: oopClient,
    [ClientType.NestJS]: nestjsClient,
  };

  return clients[type].join("\n");
}
