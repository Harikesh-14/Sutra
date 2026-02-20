import chalk from "chalk";
import { getCurrentBranch, getRemoteUrl, isGitRepository } from "../utils/git.js";
import { exists, readConfig, writeConfig } from "../memory/sutraStore.js";

export async function reinitCommand() {
  if (!exists()) {
    console.log(chalk.red("❌ .sutra file not found. Run `sutra init` first."))
    process.exit(1)
  }
  
  if (!isGitRepository()) {
    console.log(chalk.red("❌ Not inside a git repository."))
    process.exit(1)
  }

  try {
    const currentConfig = readConfig()

    const newRepo = getRemoteUrl()
    const newBranch = getCurrentBranch()

    const repoChanged = currentConfig.REPOSITORY_URL !== newRepo
    const branchChanged = currentConfig.BRANCH_NAME !== newBranch

    if (!repoChanged && !branchChanged) {
      console.log(chalk.yellow("⚠️  Repository and branch are the same as current configuration. No changes made."))
      return
    }

    const updateConfig = {
      ...currentConfig,
      REPOSITORY_URL: newRepo,
      BRANCH_NAME: newBranch,
    }

    writeConfig(updateConfig)

    console.log(chalk.green("✅ Sutra reinitialized successfully!"))

    if (repoChanged) {
      console.log(chalk.blue(`Repository updated to: ${newRepo}`))
    }

    if (branchChanged) {
      console.log(chalk.blue(`Branch updated to: ${newBranch}`))
    }
  } catch (error: any) {
    console.log(chalk.red("❌ Failed to reinitialize Sutra."))
    console.log(error.message)
    process.exit(1)
  }
}
