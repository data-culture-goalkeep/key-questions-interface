"use server"

import { createClient } from "@/lib/supabase/server"
import type { CommentType } from "@/lib/types"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Not signed in.")
  return { supabase, user }
}

export async function addComment(
  projectId: string,
  kqId: string,
  commentText: string,
  commentType: CommentType
) {
  const { supabase, user } = await requireUser()
  const { error } = await supabase.from("key_question_comments").insert({
    key_question_id: kqId,
    author_id: user.id,
    author_email: user.email,
    comment_text: commentText,
    comment_type: commentType,
  })
  if (error) throw error
}

export async function setCommentResolved(
  projectId: string,
  commentId: string,
  resolved: boolean
) {
  const { supabase } = await requireUser()
  const { error } = await supabase
    .from("key_question_comments")
    .update({ status: resolved ? "resolved" : "open" })
    .eq("id", commentId)
  if (error) throw error
}

export async function toggleVerified(
  projectId: string,
  kqId: string,
  currentlyVerified: boolean
) {
  const { supabase, user } = await requireUser()

  if (currentlyVerified) {
    const { error } = await supabase
      .from("key_question_client_reviews")
      .delete()
      .eq("key_question_id", kqId)
      .eq("user_id", user.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("key_question_client_reviews").insert({
      key_question_id: kqId,
      user_id: user.id,
      user_email: user.email,
    })
    if (error) throw error
  }
}
