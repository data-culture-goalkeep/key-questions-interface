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
  /** Shared flag — collated into the "next steps" summary. */
  toIncorporate: boolean
  /**
   * Production-deploy timestamp of the round that shipped the change this
   * comment fed. `toIncorporate && !incorporatedAt` == still pending.
   */
  incorporatedAt: string | null
}

/** Per-row data entry the team adds to a generated next-steps table. */
export interface SummaryRowAnnotation {
  confirmed: boolean
  instructions: string
  /** Set once the row's change ships. 1-based; null while pending. */
  incorporatedRound: number | null
  /** Production-deploy timestamp for that round. */
  incorporatedAt: string | null
  /** One-line record of what was actually changed. */
  changeMade: string
}

/** True once a row's change has shipped (Confirm/Instructions then lock). */
export function isRowIncorporated(a: SummaryRowAnnotation | undefined): boolean {
  return !!a && a.incorporatedRound != null
}

export interface MockupSummary {
  id: string
  content: string
  commentCount: number
  createdAt: string
  /** Keyed by the table's "#" column (falls back to 1-based row position). */
  rowAnnotations: Record<string, SummaryRowAnnotation>
}

/** Everything the dashboard views need, fetched once by getMockupData. */
export interface MockupData {
  reviewers: Reviewer[]
  answers: ElementAnswer[]
  comments: MockupComment[]
  latestSummary: MockupSummary | null
}

/** Coerce a raw `row_annotations` jsonb value into a well-formed map. */
export function normalizeRowAnnotations(
  raw: unknown,
): Record<string, SummaryRowAnnotation> {
  const out: Record<string, SummaryRowAnnotation> = {}
  if (!raw || typeof raw !== "object") return out
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const v = (value ?? {}) as Record<string, unknown>
    out[key] = {
      confirmed: v.confirmed === true,
      instructions: typeof v.instructions === "string" ? v.instructions : "",
      incorporatedRound:
        typeof v.incorporatedRound === "number" ? v.incorporatedRound : null,
      incorporatedAt:
        typeof v.incorporatedAt === "string" ? v.incorporatedAt : null,
      changeMade: typeof v.changeMade === "string" ? v.changeMade : "",
    }
  }
  return out
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
