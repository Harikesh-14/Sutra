import chalk from "chalk";
import type { CommitHistory } from "../types.js";

const MAX_INPUT_SIZE = 4000;

export async function generateProjectAnalysis(
  commitHistory: CommitHistory[]
): Promise<string> {
  try {
    if (!commitHistory.length) {
      return "⚠️ No commits found in this repository.";
    }

    // Create lightweight summary instead of raw JSON dump
    const commitSummary = commitHistory
      .slice(0, 50)
      .map(
        (c) =>
          `- ${c.date} | ${c.author} | ${c.message}`
      )
      .join("\n");

    const trimmedInput =
      commitSummary.length > MAX_INPUT_SIZE
        ? commitSummary.slice(0, MAX_INPUT_SIZE)
        : commitSummary;

    const prompt = `
You are an expert software engineer.

Analyze the following commit history and provide insights on:
- Project progress
- Key milestones
- Potential risks
- Areas of improvement
- Clear next steps

Rules:
- Use emojis
- Do NOT include markdown
- Do NOT wrap in backticks

Commit History:
${trimmedInput}
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "ministral-3",
          prompt,
          stream: false,
          options: {
            temperature: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        chalk.red("Ollama error response:"),
        errorText
      );
      throw new Error(
        `AI generation failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data?.response) {
      throw new Error("Invalid AI response format.");
    }

    return data.response.trim();
  } catch (err: any) {
    console.error(
      chalk.red("❌ Failed to generate project analysis.")
    );
    console.error(err?.message || err);
    return "⚠️ AI analysis failed. Please try again later.";
  }
}