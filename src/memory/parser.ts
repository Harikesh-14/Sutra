import type { DetailLevel, SutraConfig, Tone } from "../types.js";
import fs from "fs"
import ini from "ini"

export function parseSutraFile(filePath: string): SutraConfig {
  const raw = fs.readFileSync(filePath, "utf-8")
  const parsed = ini.parse(raw)

  if (!parsed.REPOSITORY_URL || !parsed.BRANCH_NAME) {
    throw new Error("Invalid .sutra file: Mandatory fields missing. Please check your REPOSITORY_URL and BRANCH_NAME again!")
  }

  return {
    REPOSITORY_URL: stripQuotes(parsed.REPOSITORY_URL),
    BRANCH_NAME: stripQuotes(parsed.BRANCH_NAME),
    STYLE: {
      USES_CONVENTIONAL: toBoolean(parsed.STYLE?.USES_CONVENTIONAL),
      TONE: stripQuotes(parsed.STYLE?.TONE) as Tone,
      DETAIL_LEVEL: stripQuotes(parsed.STYLE?.DETAIL_LEVEL) as DetailLevel
    },
    ANALYSIS: {
      ENABLE_PROGRESS_ANALYSIS: toBoolean(parsed.ANALYSIS?.ENABLE_PROGRESS_ANALYSIS),
      CACHE_ANALYSIS: toBoolean(parsed.ANALYSIS?.CACHE_ANALYSIS)
    }
  }
}

function stripQuotes(value: string): string {
  if (!value) return ""
  return value.replace(/^"(.*)"$/, "$1")
}

function toBoolean(value: string | boolean): boolean {
  return value === true || value === "true"
}
