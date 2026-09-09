// Shared domain types for the Mockup Navigator (Sandipani dashboard review).
// Mirrors the mockup_navigator schema; see docs/mockup-navigator/comment-schema.md.

export type AnswerValue = "yes" | "partly" | "no"
export type CommentScope = "element" | "page" | "overall"

export interface Reviewer {
  id: string
  name: string
  reviewGroup: number
}

export interface ElementAnswer {
  id: string
  reviewerId: string
  viewId: string
  elementNum: string
  answersKq: AnswerValue | null
  enablesAction: AnswerValue | null
  updatedAt: string
}

export interface MockupComment {
  id: string
  reviewerId: string
  reviewerName: string
  scope: CommentScope
  viewId: string | null
  elementNum: string | null
  parentId: string | null
  body: string
  confidence: number | null
  isExample: boolean
  resolvedAt: string | null
  createdAt: string
}

/** Everything the dashboard views need, fetched once by getMockupData. */
export interface MockupData {
  reviewers: Reviewer[]
  answers: ElementAnswer[]
  comments: MockupComment[]
}

// ----- derived view helpers -----

/** `${viewId}:${elementNum}` — the key used throughout the UI. */
export function elementKey(viewId: string, elementNum: string): string {
  return `${viewId}:${elementNum}`
}

export interface StructuredAnswer {
  answersKq: AnswerValue | null
  enablesAction: AnswerValue | null
}

/** An element counts as reviewed once "Answers the KQ?" has a value. */
export function isReviewed(a: StructuredAnswer | undefined): boolean {
  return !!a?.answersKq
}

/** "Needs decision" = any structured answer that is not "yes". */
export function needsDecision(a: StructuredAnswer | undefined): boolean {
  if (!a) return false
  return (
    (!!a.answersKq && a.answersKq !== "yes") ||
    (!!a.enablesAction && a.enablesAction !== "yes")
  )
}
