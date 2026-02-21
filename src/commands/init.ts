import inquirer from "inquirer"
import { getRemoteUrl, getCurrentBranch, isGitRepository } from "../utils/git.js"
import { writeConfig, createDefaultConfig, exists } from "../memory/sutraStore.js"
import chalk from "chalk"
import { execSync } from "child_process"

export async function initCommand() {
  if (exists()) {
    console.log(chalk.red("⚠️ .sutra file already exists."))
    process.exit(1)
  }

  let repo: string
  let branch: string

  if (isGitRepository()) {
    try {
      repo = getRemoteUrl()
      branch = getCurrentBranch()

      console.log(chalk.green("📦 Git repository detected."))
      console.log(chalk.yellow(`Repository: ${repo}`))
      console.log(chalk.yellow(`Branch: ${branch}`))
    } catch (error: any) {
      console.log(chalk.yellow("⚠️ Git detected but failed to read details."))
        ; ({ repo, branch } = await promptUserForConfig())
      execSync(`git remote add origin ${repo}`, { stdio: "inherit" })
      execSync(`git checkout -B ${branch}`, { stdio: "inherit" })
    }
  } else {
    console.log(chalk.yellow("⚠️ Git repository not detected."))
      ; ({ repo, branch } = await promptUserForConfig())
    execSync("git init", { stdio: "inherit" })
    execSync(`git remote add origin ${repo}`, { stdio: "inherit" })
    execSync(`git checkout -b ${branch}`, { stdio: "inherit" })
  }

  const config = createDefaultConfig(repo, branch)
  writeConfig(config)

  console.log(chalk.green("✅ Sutra initialized successfully!"))
  console.log(chalk.blue("Next steps:"))
  console.log(chalk.blue("1. Run 'sutra commit' to generate commit messages and push changes."))
  console.log(chalk.blue("2. Run 'sutra analyze' to get insights on your project progress and commit history."))
}

async function promptUserForConfig() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "repo",
      message: "Enter the Git repository URL:",
      validate: (input: string) => input.length > 0 || "Repository URL cannot be empty"
    },
    {
      type: "input",
      name: "branch",
      message: "Enter the branch name:",
      default: "main",
      validate: (input: string) => input.length > 0 || "Branch name cannot be empty"
    }
  ])

  return answers
}