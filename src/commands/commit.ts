import chalk from "chalk";
import { exists, readConfig } from "../memory/sutraStore.js";
import { ensureSyncedWithRemote, getCurrentBranch, getFullProjectSnapshot, getStagedDiff, hasCommits, hasUncommittedChanges, isGitRepository, pushWithRetry, stageAllChanges } from "../utils/git.js";
import { execSync, spawnSync } from "child_process";
import inquirer from "inquirer";
import { analyzeAndGenerateCommit } from "../ai/commitAnalyzer.js";
import { formatMessage } from "../utils/formatMessage.js";

// export async function commitCommand() {
//   // 0. Validate environment (.sutra + git repo)
//   if (!exists()) {
//     console.log(chalk.red("⚠️ .sutra configuration not found. Please run 'sutra init' first."))
//     process.exit(1)
//   }

//   if (!isGitRepository()) {
//     console.log(chalk.red("⚠️ Current directory is not a Git repository. Please initialize a Git repository first."))
//     process.exit(1)
//   }

//   const config = readConfig()
//   const repoHasCommits = hasCommits()
//   const branch = getCurrentBranch()

//   if (repoHasCommits) {
//     if (repoHasCommits) {
//       const currBranch = execSync("git rev-parse --abbrev-ref HEAD")
//         .toString()
//         .trim();

//       if (currBranch !== getCurrentBranch()) {
//         console.log(
//           chalk.red(
//             `⚠️ You are on '${currBranch}', but configured branch is '${branch}'.`
//           )
//         );
//         process.exit(1);
//       }

//       ensureSyncedWithRemote(branch) // Ensure the branch is synced with remote
//     }
//   }

//   // 1. Check if there are changes
//   if (!hasUncommittedChanges()) {
//     console.log(chalk.yellow("⚠️ No uncommitted changes detected. Nothing to commit."))
//     return
//   }

//   // 2. Stage changes (optional confirmation)
//   console.log(chalk.blue("✨ Staging all changes..."))
//   stageAllChanges()

//   let analysisInput;

//   if (!repoHasCommits) {
//     console.log(chalk.blue("🆕 First commit detected. Analyzing full project..."));
//     analysisInput = getFullProjectSnapshot();
//   } else {
//     console.log(chalk.blue("🔁 Existing repository detected. Analyzing diff..."));
//     analysisInput = getStagedDiff();
//   }

//   if (!analysisInput) {
//     console.log(chalk.red("⚠️ Failed to get staged changes. Please check your git status."))
//     process.exit(1)
//   }

//   // 3. Generate AI commit message
//   console.log(chalk.blue("🤖 Generating commit message using AI..."))

//   const aiMessage = await analyzeAndGenerateCommit(analysisInput, config, { isInitialCommit: !repoHasCommits })

//   // 4. Show message preview
//   console.log(chalk.green("✅ AI-generated commit message:"))
//   console.log(chalk.cyan(formatMessage(aiMessage.message, aiMessage.type, aiMessage.scope)))

//   // 5. Ask for confirmation
//   const { confirm } = await inquirer.prompt([
//     {
//       type: "confirm",
//       name: "confirm",
//       message: "Do you want to use this commit message?",
//       default: true
//     }
//   ])

//   if (!confirm) {
//     console.log(chalk.red("⛓️‍💥 Commit aborted by user."))
//     process.exit(0)
//   }

//   // 6. Commit
//   execSync(`git commit -m "${formatMessage(aiMessage.message, aiMessage.type, aiMessage.scope)}"`, { stdio: "inherit" })

//   // 7. Push
//   pushWithRetry(branch)

//   console.log(chalk.green("🚀 Changes committed and pushed successfully!"))
// }

export async function commitCommand() {
  // 0. Validate environment
  if (!exists()) {
    console.log(chalk.red("⚠️ .sutra configuration not found. Please run 'sutra init' first."));
    process.exit(1);
  }

  if (!isGitRepository()) {
    console.log(chalk.red("⚠️ Current directory is not a Git repository."));
    process.exit(1);
  }

  const config = readConfig();
  const repoHasCommits = hasCommits();
  const branch = config.BRANCH_NAME; // ← Always trust config

  // Validate branch only if commits exist
  if (repoHasCommits) {
    const currBranch = getCurrentBranch();

    if (currBranch !== branch) {
      console.log(
        chalk.red(`⚠️ You are on '${currBranch}', but configured branch is '${branch}'.`)
      );
      process.exit(1);
    }

    ensureSyncedWithRemote(branch);
  }

  // 1. Check for changes
  if (!hasUncommittedChanges()) {
    console.log(chalk.yellow("⚠️ No uncommitted changes detected."));
    return;
  }

  // 2. Stage changes
  console.log(chalk.blue("✨ Staging all changes..."));
  stageAllChanges();

  let analysisInput: string;

  if (!repoHasCommits) {
    console.log(chalk.blue("🆕 First commit detected. Analyzing full project..."));
    analysisInput = getFullProjectSnapshot();
  } else {
    console.log(chalk.blue("🔁 Existing repository detected. Analyzing diff..."));
    analysisInput = getStagedDiff();
  }

  if (!analysisInput) {
    console.log(chalk.red("⚠️ Failed to analyze changes."));
    process.exit(1);
  }

  // 3. Generate AI commit message
  console.log(chalk.blue("🤖 Generating commit message using AI..."));

  const aiMessage = await analyzeAndGenerateCommit(
    analysisInput,
    config,
    { isInitialCommit: !repoHasCommits }
  );

  const finalMessage = formatMessage(
    aiMessage.message,
    aiMessage.type,
    aiMessage.scope
  );

  console.log(chalk.green("✅ AI-generated commit message:"));
  console.log(chalk.cyan(finalMessage));

  // 4. Confirm
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Do you want to use this commit message?",
      default: true
    }
  ]);

  if (!confirm) {
    console.log(chalk.red("⛓️‍💥 Commit aborted."));
    process.exit(0);
  }

  // 5. Commit safely (escape quotes)
  const commitResult = spawnSync("git", ["commit", "-m", finalMessage], {
    stdio: "inherit"
  });

  if (commitResult.status !== 0) {
    console.log(chalk.red("⚠️ Git commit failed. Please check the error message above."));
    process.exit(1);
  }

  // 6. Push
  pushWithRetry(branch);

  console.log(chalk.green("🚀 Changes committed and pushed successfully!"));
}