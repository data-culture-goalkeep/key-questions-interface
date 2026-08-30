import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"

import { PrioritizeView } from "./prioritize-view"

export interface PrioritizeKq {
  id: string
  kq_number: string
  question_text: string
  indicator_type: string
  priority: string
  is_locked: boolean
}

export interface VoteRow {
  key_question_id: string
  voter_id: string
  rank_within_type: number
}

export default async function PrioritizePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const userContext = await getCurrentUserContext()
  const role = userContext?.role ?? "client"
  const userId = userContext?.userId ?? ""
  const supabase = await createClient()

  const { data: keyQuestions } = await supabase
    .from("key_questions")
    .select("id, kq_number, question_text, indicator_type, priority, is_locked")
    .eq("project_id", projectId)

  const kqIds = (keyQuestions ?? []).map((k) => k.id)

  const [{ data: myVotes }, { data: allVotes }] = await Promise.all([
    kqIds.length > 0
      ? supabase
          .from("key_question_priority_votes")
          .select("key_question_id, voter_id, rank_within_type")
          .in("key_question_id", kqIds)
          .eq("voter_id", userId)
      : Promise.resolve({ data: [] }),
    role === "facilitator" && kqIds.length > 0
      ? supabase
          .from("key_question_priority_votes")
          .select("key_question_id, voter_id, rank_within_type")
          .in("key_question_id", kqIds)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <PrioritizeView
      projectId={projectId}
      role={role}
      keyQuestions={(keyQuestions ?? []) as PrioritizeKq[]}
      myVotes={(myVotes ?? []) as VoteRow[]}
      allVotes={(allVotes ?? []) as VoteRow[]}
    />
  )
}
