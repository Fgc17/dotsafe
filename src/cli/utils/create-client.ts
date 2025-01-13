import { ClientType } from "src/tsenv/types";

const functionalClient = [
  'import { client } from "@ferstack/ts-env/client";',
  "",

  "export type EnvironmentVariables = '';",
  "",

  "const get = (key: EnvironmentVariables) => {",
  "  return client.get(key);",
  "};",
  "",

  "const getNumber = (key: EnvironmentVariables) => {",
  "  return client.getNumber(key);",
  "};",
  "",

  "export const env = {",
  "  get,",
  "  getNumber,",
  "};",
];

const oopClient = [
  'import { client } from "@ferstack/ts-env/client";',
  "",

  "export type EnvironmentVariables = '';",
  "",

  "export class EnvService {",
  "  get(key: EnvironmentVariables) {",
  "    return client.get(key);",
  "  }",
  "",

  "  getNumber(key: EnvironmentVariables) {",
  "    return client.getNumber(key);",
  "  }",
  "}",
];

const nestjsClient = [
  "import { Injectable } from '@nestjs/common';",
  'import { client } from "@ferstack/ts-env/client";',
  "",

  "export type EnvironmentVariables = '';",
  "",

  "@Injectable()",
  "export class EnvService {",
  "  get(key: EnvironmentVariables) {",
  "    return client.get(key);",
  "  }",
  "",

  "  getNumber(key: EnvironmentVariables) {",
  "    return client.getNumber(key);",
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
