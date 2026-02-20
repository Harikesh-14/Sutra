import chalk from "chalk";
import { readConfig } from "../memory/sutraStore.js";

export async function whoamiCommand() {
  try {
    const config = readConfig()
    console.log(chalk.green("✅ Current user information:"))
    console.log(chalk.blue(`Repository: ${config.REPOSITORY_URL}`))
    console.log(chalk.blue(`Branch: ${config.BRANCH_NAME}`))
  } catch (error: any) {
    console.log(chalk.red("❌ Error fetching the current user information"))
    console.log(error.message)
  }
}