#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { reinitCommand } from "./commands/reinit.js";
import { whoamiCommand } from "./commands/whoami.js";
import { commitCommand } from "./commands/commit.js";
import { analyzeCommand } from "./commands/analyze.js";

const program = new Command()

program
  .name("sutra")
  .description("AI-powered Git workflow assistant")
  .version("1.0.0")

// ========================
// Core Commands
// ========================

program
  .command("init")
  .description("Initialize Sutra in the current repository")
  .action(initCommand)

program
  .command("reinit")
  .description("Reinitialize Sutra configuration")
  .action(reinitCommand)

program
  .command("commit")
  .description("Generate commit message and push the changes")
  .action(commitCommand)

program
  .command("analyze")
  .description("Analyze project progress and commit history")
  .action(analyzeCommand)

program
  .command("whoami")
  .description("Shows the linked repository and branch")
  .action(whoamiCommand)

program.parse(process.argv)
