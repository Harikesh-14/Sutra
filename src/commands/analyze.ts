import chalk from "chalk";
import boxen from "boxen";
import { exists } from "../memory/sutraStore.js";
import { isGitRepository } from "../utils/git.js";
import { execFileSync } from "child_process";
import { generateProjectAnalysis } from "../ai/projectAnalysis.js";

function formatAnalysisOutput(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/---/g, "")
    .trim();
}

function printStyledAnalysis(text: string) {
  const formatted = formatAnalysisOutput(text);

  console.log(
    boxen(
      chalk.bold.blue("📊 Sutra Project Analysis"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  console.log();

  formatted.split("\n").forEach((line) => {
    if (
      line.toLowerCase().includes("milestone")
    ) {
      console.log(chalk.yellow.bold(line));
    } else if (
      line.toLowerCase().includes("risk") ||
      line.toLowerCase().includes("gap")
    ) {
      console.log(chalk.red.bold(line));
    } else if (
      line.toLowerCase().includes("next step")
    ) {
      console.log(chalk.green.bold(line));
    } else if (line.trim().startsWith("-")) {
      console.log(chalk.gray(line));
    } else {
      console.log(chalk.white(line));
    }
  });
}

export async function analyzeCommand() {
  try {
    if (!exists()) {
      console.log(
        chalk.red(
          "⚠️ .sutra configuration not found. Please run 'sutra init' first."
        )
      );
      process.exit(1);
    }

    if (!isGitRepository()) {
      console.log(
        chalk.red(
          "⚠️ Current directory is not a Git repository."
        )
      );
      process.exit(1);
    }

    console.log(
      chalk.blue(
        "🔍 Analyzing project progress with AI..."
      )
    );

    const raw = execFileSync("git", [
      "log",
      "--pretty=format:%H|%an|%ad|%f",
    ]).toString();

    const commitHistory = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [commit, author, date, message] =
          line.split("|");
        return {
          commit: commit ?? "",
          author: author ?? "",
          date: date ?? "",
          message: message ?? "",
        };
      });

    const aiMessage =
      await generateProjectAnalysis(
        commitHistory
      );

    console.log(
      chalk.green(
        "✔ Analysis completed successfully\n"
      )
    );

    printStyledAnalysis(aiMessage);
  } catch (err: any) {
    console.log(
      chalk.red(
        "❌ Error: Failed to analyze project progress."
      )
    );
    console.error(err);
  }
}