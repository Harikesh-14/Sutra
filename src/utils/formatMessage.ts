import type { CommitType } from "../types.js";

export function formatMessage(
  message: string,
  commitType: CommitType,
  scope?: string
): string {
  const formattedMessage = `[${commitType}${scope ? `(${scope})` : ""}] ${message}`;
  return formattedMessage;
}

export function formatAnalysisOutput(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/---/g, "")
    .trim();
}