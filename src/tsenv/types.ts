import { DotenvParseOutput } from "dotenv";

export type EnvironmentVariables = Record<string, string>;

export type TSEnvLoader = (env: {
  processEnv: DotenvParseOutput;
  parse: <T extends DotenvParseOutput>(src: string | Buffer) => T;
}) => Promise<EnvironmentVariables | null | undefined>;

export interface GenericClass<T> extends Function {
  new (...args: any[]): T;
}

export enum ClientType {
  Functional = "functional",
  NestJS = "nestjs",
  OOP = "oop",
}
