import type { SutraConfig } from "../types.js";

export function serializeSutra(config: SutraConfig): string {
  return `
REPOSITORY_URL = ${config.REPOSITORY_URL}
BRANCH_NAME = ${config.BRANCH_NAME}

[STYLE]
USES_CONVENTIONAL = ${config.STYLE.USES_CONVENTIONAL}
TONE = ${config.STYLE.TONE}
DETAIL_LEVEL = ${config.STYLE.DETAIL_LEVEL}

[ANALYSIS]
ENABLE_PROGRESS_ANALYSIS = ${config.ANALYSIS.ENABLE_PROGRESS_ANALYSIS}
CACHE_ANALYSIS = ${config.ANALYSIS.CACHE_ANALYSIS}
`.trim()
}
