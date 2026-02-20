import fs from "fs"
import path from "path"
import { parseSutraFile } from "./parser.js"
import { serializeSutra } from "./serializer.js"
import type { SutraConfig } from "../types.js"

const FILE_NAME = ".sutra"

function getPath(): string {
  return path.join(process.cwd(), FILE_NAME)
}

export function exists(): boolean {
  return fs.existsSync(getPath())
}

export function readConfig(): SutraConfig {
  if (!exists()) {
    throw new Error(".sutra file not found. Run `sutra init`.")
  }

  return parseSutraFile(getPath())
}

export function writeConfig(config: SutraConfig): void {
  const content = serializeSutra(config)
  fs.writeFileSync(getPath(), content, "utf-8")
}

export function createDefaultConfig(
  repo: string,
  branch: string
): SutraConfig {
  return {
    REPOSITORY_URL: repo,
    BRANCH_NAME: branch,
    STYLE: {
      USES_CONVENTIONAL: true,
      TONE: "imperative",
      DETAIL_LEVEL: "moderate"
    },
    ANALYSIS: {
      ENABLE_PROGRESS_ANALYSIS: true,
      CACHE_ANALYSIS: false
    }
  }
}