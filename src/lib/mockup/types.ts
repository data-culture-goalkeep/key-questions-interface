// Shared domain types for the Mockup Navigator (Sandipani dashboard review).
// Mirrors the mockup_navigator schema; see docs/mockup-navigator/comment-schema.md.

export type AnswerValue = "yes" | "partly" | "no"
export type CommentScope = "element" | "page" | "overall"

export interface Reviewer {
  id: string
  name: string
  reviewGroup: number | null
}

export interface ElementAnswer {
  id: string
  reviewerId: string
  viewId: string
  elementNum: string
  /** Single merged verdict — "Is this chart good to go?" */
  verdict: AnswerValue | null
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
  editedAt: string | null
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
  verdict: AnswerValue | null
}

/** An element counts as reviewed once it has a verdict. */
export function isReviewed(a: StructuredAnswer | undefined): boolean {
  return !!a?.verdict
}

/** "Needs decision" = a verdict that is not "yes". */
export function needsDecision(a: StructuredAnswer | undefined): boolean {
  return !!a?.verdict && a.verdict !== "yes"
}
