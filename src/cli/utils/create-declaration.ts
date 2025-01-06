export function createDeclaration(env: Record<string, string>) {
  const declarationFileLines = [
    "export interface ProcessEnv {",
    ...Object.keys(env).map((key) => `  ${key}: string;`),
    "}",
  ];

  return declarationFileLines.join("\n");
}
