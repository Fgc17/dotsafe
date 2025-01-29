import path from "node:path";

export function getCallerLocation(index: number = 3) {
  const callerStack = new Error().stack || "";
  const callerLine = callerStack.split("\n")[index];
  const callerFileMatch =
    callerLine.match(/\((.*):\d+:\d+\)$/) ||
    callerLine.match(/at (.*):\d+:\d+/);
  const filePath = callerFileMatch ? callerFileMatch[1] : "unknown";
  const folderPath = path.dirname(filePath);

  return { filePath, folderPath };
}
