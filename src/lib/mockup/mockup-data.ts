"use server"

import { createClient } from "./supabase/server"
import type {
  AnswerValue,
  CommentScope,
  ElementAnswer,
  MockupComment,
  MockupData,
  MockupSummary,
  Reviewer,
} from "./types"

interface ReviewerRow {
  id: string
  name: string
  review_group: number
}
interface AnswerRow {
  id: string
  reviewer_id: string
  view_id: string
  element_num: string
  verdict: AnswerValue | null
  answers_kq: AnswerValue | null
  updated_at: string
}
interface CommentRow {
  id: string
  reviewer_id: string
  scope: CommentScope
  view_id: string | null
  element_num: string | null
  parent_id: string | null
  body: string
  confidence: number | null
  is_example: boolean
  resolved_at: string | null
  created_at: string
  edited_at: string | null
  to_incorporate: boolean
}
interface SummaryRow {
  id: string
  content: string
  comment_count: number
  created_at: string
}

/**
 * The single combined fetch for the Sandipani mockup. Called once by
 * MockupDataProvider on mount; every view/screen switch is then served from
 * the React context cache with no further network calls. Add fields here
 * rather than introducing a second fetch.
 */
export async function getMockupData(): Promise<MockupData> {
  const supabase = createClient()

  const [reviewersRes, answersRes, commentsRes, summaryRes] = await Promise.all([
    supabase
      .from("sandipani_reviewers")
      .select("id, name, review_group")
      .order("name"),
    supabase
      .from("sandipani_element_answers")
      .select(
        "id, reviewer_id, view_id, element_num, verdict, answers_kq, updated_at",
      ),
    supabase
      .from("sandipani_comments")
      .select(
        "id, reviewer_id, scope, view_id, element_num, parent_id, body, confidence, is_example, resolved_at, created_at, edited_at, to_incorporate",
      )
      .order("created_at"),
    supabase
      .from("sandipani_summaries")
      .select("id, content, comment_count, created_at")
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  if (reviewersRes.error) throw reviewersRes.error
  if (answersRes.error) throw answersRes.error
  if (commentsRes.error) throw commentsRes.error
  if (summaryRes.error) throw summaryRes.error

  const reviewers: Reviewer[] = (reviewersRes.data as ReviewerRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    reviewGroup: r.review_group,
  }))
  const nameById = new Map(reviewers.map((r) => [r.id, r.name]))

  const answers: ElementAnswer[] = (answersRes.data as AnswerRow[]).map((a) => ({
    id: a.id,
    reviewerId: a.reviewer_id,
    viewId: a.view_id,
    elementNum: a.element_num,
    verdict: a.verdict ?? a.answers_kq,
    updatedAt: a.updated_at,
  }))

  const comments: MockupComment[] = (commentsRes.data as CommentRow[]).map((c) => ({
    id: c.id,
    reviewerId: c.reviewer_id,
    reviewerName: nameById.get(c.reviewer_id) ?? "Reviewer",
    scope: c.scope,
    viewId: c.view_id,
    elementNum: c.element_num,
    parentId: c.parent_id,
    body: c.body,
    confidence: c.confidence,
    isExample: c.is_example,
    resolvedAt: c.resolved_at,
    createdAt: c.created_at,
    editedAt: c.edited_at,
    toIncorporate: c.to_incorporate,
  }))

  const summaryRow = (summaryRes.data as SummaryRow[])[0]
  const latestSummary: MockupSummary | null = summaryRow
    ? {
        id: summaryRow.id,
        content: summaryRow.content,
        commentCount: summaryRow.comment_count,
        createdAt: summaryRow.created_at,
      }
    : null

  return { reviewers, answers, comments, latestSummary }
}
