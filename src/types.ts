export type Tone = "imperative" | "past" | "present"
export type DetailLevel = "low" | "moderate" | "high"
export type CommitType =
  | "feat"
  | "fix"
  | "refactor"
  | "docs"
  | "test"
  | "chore"
  | "perf"

export interface AICommitResponse {
  type: CommitType
  scope?: string
  message: string
}

export interface SutraStyle {
  USES_CONVENTIONAL: boolean
  TONE: Tone
  DETAIL_LEVEL: DetailLevel
}

export interface SutraAnalysis {
  ENABLE_PROGRESS_ANALYSIS: boolean
  CACHE_ANALYSIS: boolean
}

export interface SutraConfig {
  REPOSITORY_URL: string
  BRANCH_NAME: string
  STYLE: SutraStyle
  ANALYSIS: SutraAnalysis
}

export interface CommitHistory {
  commit: string,
  author: string,
  date: string,
  message: string
}