"use server"

import { createAdminClient } from "./supabase/admin"
import type { AnswerValue, CommentScope } from "./types"

// No auth in this app — every write runs through the service-role client
// inside these actions. The reviewer is identified by the id looked up from
// the seeded fixed list (chosen by name on the brief screen).

export async function setElementAnswer(input: {
  reviewerId: string
  viewId: string
  elementNum: string
  field: "answersKq" | "enablesAction"
  value: AnswerValue
}): Promise<void> {
  const column = input.field === "answersKq" ? "answers_kq" : "enables_action"
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("sandipani_element_answers")
    .upsert(
      {
        reviewer_id: input.reviewerId,
        view_id: input.viewId,
        element_num: input.elementNum,
        [column]: input.value,
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
