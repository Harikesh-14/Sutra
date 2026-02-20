import chalk from "chalk";
import { execSync } from "child_process";

export function getRemoteUrl(): string {
  try {
    const url = execSync("git config --get remote.origin.url")
      .toString()
      .trim()

    if (!url) {
      throw new Error("No remote origin found.")
    }

    return url
  } catch {
    throw new Error("Failed to get git remote origin URL.")
  }
}

export function getCurrentBranch(): string {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim()

    if (!branch) {
      throw new Error("Branch name not found.")
    }

    return branch
  } catch {
    throw new Error("Failed to get the branch name.")
  }
}

export function isGitRepository(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree")
    return true
  } catch {
    return false
  }
}

export function hasCommits(): boolean {
  try {
    execSync("git rev-parse HEAD", { stdio: "ignore" });
    return true
  } catch {
    return false
  }
}

export function getFullProjectSnapshot() {
  return execSync("git ls-files", { encoding: "utf-8" });
}

export function hasUncommittedChanges(): boolean {
  try {
    const status = execSync("git status --porcelain").toString().trim()
    return status.length > 0
  } catch {
    return false
  }
}

export function stageAllChanges(): void {
  execSync("git add .")
}

export function commitChanges(message: string): void {
  execSync(`git commit -m "${message}"`, { stdio: "inherit" })
}

export function pushChanges(): void {
  execSync(`git push -u origin ${getCurrentBranch()}`, { stdio: "inherit" })
}

export function getStagedDiff(): string {
  try {
    const diff = execSync("git diff --staged").toString()
    return diff
  } catch {
    return ""
  }
}

export function getUnstagedDiff(): string {
  try {
    const diff = execSync("git diff").toString()
    return diff
  } catch {
    return ""
  }
}

// TODO: Read from here
export function fetchRemote(branch: string): void {
  console.log(chalk.blue(`📡 Fetching latest changes from remote for branch '${branch}'...`))
  execSync(`git fetch origin ${branch}`, { stdio: "inherit" })
}

export function getAheadBehind(branch: string): { ahead: number; behind: number } {
  try {
    const result = execSync(
      `git rev-list --left-right --count HEAD...origin/${branch}`
    ).toString().trim()

    const [ahead, behind] = result.split("\t").map(Number)
    if (ahead && behind) {
      return { ahead, behind }
    } else {
      throw new Error("Unexpected output from git rev-list")
    }
  } catch {
    return { ahead: 0, behind: 0 }
  }
}

function rebaseOntoRemote(branch: string) {
  console.log(chalk.blue(`⬇️ Rebasing onto origin/${branch}...`));
  try {
    execSync(`git rebase origin/${branch}`, { stdio: "inherit" });
  } catch (error) {
    console.log(
      chalk.red(
        "⚠️ Rebase conflict detected. Please resolve conflicts manually and run 'git rebase --continue'."
      )
    );
    process.exit(1);
  }
}

export function ensureSyncedWithRemote(branch: string) {
  fetchRemote(branch);

  const { ahead, behind } = getAheadBehind(branch);

  if (behind > 0 && ahead === 0) {
    console.log(
      chalk.yellow(`📥 Remote is ${behind} commit(s) ahead. Syncing...`)
    );
    rebaseOntoRemote(branch);
  }

  if (behind > 0 && ahead > 0) {
    console.log(
      chalk.red(
        `⚠️ Branch has diverged (ahead ${ahead}, behind ${behind}).`
      )
    );
    console.log(
      chalk.yellow(
        "Please manually reconcile (rebase or merge) before using sutra commit."
      )
    );
    process.exit(1);
  }
}

export function pushWithRetry(branch: string) {
  try {
    execSync(`git push -u origin ${branch}`, { stdio: "inherit" });
  } catch (error: any) {
    console.log(chalk.yellow("⚠️ Push rejected. Attempting to sync and retry..."));

    fetchRemote(branch);

    try {
      rebaseOntoRemote(branch);
      execSync(`git push -u origin ${branch}`, { stdio: "inherit" });
    } catch {
      console.log(
        chalk.red(
          "❌ Push failed after retry. Please resolve conflicts manually."
        )
      );
      process.exit(1);
    }
  }
}