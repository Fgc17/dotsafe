import type { select } from "@inquirer/prompts";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyType = any;

export type InquirerSelectChoice = Parameters<typeof select>[0]["choices"];

export type Language = "typescript" | "javascript";

export type Validator = "zod" | "class-validator" | "typia" | "custom";

export type Adapter =
	| "dotenv"
	| "infisical"
	| "vercel"
	| "triggerdev"
	| "heroku"
	| "custom";
