"use server"

import { createAdminClient } from "./supabase/admin"
import type { AnswerValue, CommentScope } from "./types"

/**
 * Make sure a reviewer row exists for `name` (preset or free-text) and return
 * its id. Called from the brief screen before entering the dashboard.
 */
export async function ensureReviewer(name: string): Promise<string> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Reviewer name is required")
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("sandipani_reviewers")
    .upsert({ name: trimmed }, { onConflict: "name" })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}

// No auth in this app — every write runs through the service-role client
// inside these actions. The reviewer is identified by the id looked up from
// the seeded fixed list (chosen by name on the brief screen).

export async function setElementAnswer(input: {
  reviewerId: string
  viewId: string
  elementNum: string
  verdict: AnswerValue
}): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("sandipani_element_answers")
    .upsert(
      {
        reviewer_id: input.reviewerId,
        view_id: input.viewId,
        element_num: input.elementNum,
        verdict: input.verdict,
      },
      { onConflict: "reviewer_id,view_id,element_num" },
    )
  if (error) throw error
}

export async function addComment(input: {
  reviewerId: string
  scope: CommentScope
  viewId?: string | null
  elementNum?: string | null
  parentId?: string | null
  body: string
  confidence?: number | null
}): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from("sandipani_comments").insert({
    reviewer_id: input.reviewerId,
    scope: input.scope,
    view_id: input.viewId ?? null,
    element_num: input.elementNum ?? null,
    parent_id: input.parentId ?? null,
    body: input.body,
    confidence: input.confidence ?? null,
  })
  if (error) throw error
}

/** Edit a comment's body in place, stamping edited_at (own comments only). */
export async function editComment(input: {
  commentId: string
  reviewerId: string
  body: string
}): Promise<void> {
  const body = input.body.trim()
  if (!body) throw new Error("Comment cannot be empty")
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("sandipani_comments")
    .update({ body, edited_at: new Date().toISOString() })
    .eq("id", input.commentId)
    .eq("reviewer_id", input.reviewerId)
  if (error) throw error
}

/** Toggle the shared "To be incorporated" flag on a comment (any reviewer). */
export async function setCommentIncorporate(input: {
  commentId: string
  value: boolean
}): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("sandipani_comments")
    .update({ to_incorporate: input.value })
    .eq("id", input.commentId)
  if (error) throw error
}

// ----- reviewer management (facilitator, from the brief screen) -----

export async function addReviewer(name: string): Promise<void> {
  await ensureReviewer(name)
}

/**
 * Delete a reviewer. Their element answers and comments cascade-delete with
 * the row (FK `on delete cascade`), so callers should warn first.
 */
export async function deleteReviewer(reviewerId: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("sandipani_reviewers")
    .delete()
    .eq("id", reviewerId)
  if (error) throw error
}

/**
 * Resolve/unresolve a thread. Resolution lives on the thread root; every
 * element-scoped comment for the same (view, element) shares the state, so
 * the toggle updates all root comments for that element.
 */
export async function setThreadResolved(input: {
  viewId: string
  elementNum: string
  resolved: boolean
}): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("sandipani_comments")
    .update({ resolved_at: input.resolved ? new Date().toISOString() : null })
    .eq("scope", "element")
    .eq("view_id", input.viewId)
    .eq("element_num", input.elementNum)
    .is("parent_id", null)
  if (error) throw error
}
