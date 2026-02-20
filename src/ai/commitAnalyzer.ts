import type { AICommitResponse, SutraConfig } from "../types.js";

const MAX_INPUT_SIZE = 5000;

export async function analyzeAndGenerateCommit(
  input: string,
  config: SutraConfig,
  options: { isInitialCommit: boolean } = { isInitialCommit: false }
): Promise<AICommitResponse> {
  const trimmedInput =
    input.length > MAX_INPUT_SIZE ? input.slice(0, MAX_INPUT_SIZE) : input;

  const prompt = buildPrompt(trimmedInput, config, options.isInitialCommit);

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "ministral-3",
      prompt,
      stream: false,
      max_tokens: 150,
      temperature: 0.3,
      format: "json"
    })
  });

  if (!response.ok) {
    throw new Error(`AI generation failed with status ${response.status}`);
  }

  const data = await response.json();

  let parsed: AICommitResponse;

  try {
    let content = data.response.trim();

    content = content.replace(/```json|```/g, "").trim();

    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response as JSON.");
  }

  if (!validateCommitResponse(parsed)) {
    throw new Error("AI response failed validation.");
  }

  return parsed;
}

function validateCommitResponse(parsed: AICommitResponse): boolean {
  const validTypes = ["feat", "fix", "refactor", "docs", "test", "chore", "perf"];

  if (!validTypes.includes(parsed.type)) {
    return false;
  }

  if (parsed.scope !== null && typeof parsed.scope !== "string") {
    return false;
  }

  if (typeof parsed.message !== "string" || !parsed.message.trim()) {
    return false;
  }

  return true;
}

function buildPrompt(
  input: string,
  config: SutraConfig,
  isInitialCommit: boolean
): string {
  if (isInitialCommit) {
    return `
You are an expert software engineer.

This is the FIRST commit of a new repository.
Analyze the project snapshot and determine what the project sets up.

Return ONLY valid JSON in this exact format:

{
  "type": "feat | fix | refactor | docs | test | chore | perf",
  "scope": "string or null",
  "message": "commit message"
}

Rules:
- This is an initial project setup commit.
- Focus on project structure, framework, and setup.
- Do NOT include explanations.
- Do NOT include markdown.
- Do NOT wrap in backticks.
- The message must follow this tone: ${config.STYLE.TONE}
- Respect detail level: ${config.STYLE.DETAIL_LEVEL}

Project Snapshot:
${input}
`;
  }

  return `
You are an expert software engineer.

Analyze the following git diff and summarize ONLY the meaningful changes.

Return ONLY valid JSON in this exact format:

{
  "type": "feat | fix | refactor | docs | test | chore | perf",
  "scope": "string or null",
  "message": "commit message"
}

Rules:
- Focus only on changes shown in the diff.
- Do NOT include explanations.
- Do NOT include markdown.
- Do NOT wrap in backticks.
- The message must follow this tone: ${config.STYLE.TONE}
- Respect detail level: ${config.STYLE.DETAIL_LEVEL}

Git Diff:
${input}
`;
}
