"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

// Rewrites the current user's full ranking for one indicator-level group in
// one go (rather than tracking incremental swaps), so every call leaves a
// complete, consistent rank_within_type for every KQ passed in — regardless
// of whether this voter had ranked this group before.
export async function setRanking(
  projectId: string,
  orderedKqIds: string[]
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not signed in.")

  const rows = orderedKqIds.map((keyQuestionId, index) => ({
    key_question_id: keyQuestionId,
    voter_id: user.id,
    rank_within_type: index + 1,
  }))

  const { error } = await supabase
    .from("key_question_priority_votes")
    .upsert(rows, { onConflict: "key_question_id,voter_id" })
  if (error) throw error

  revalidatePath("/projects/[projectSlug]/prioritize", "page")
}
