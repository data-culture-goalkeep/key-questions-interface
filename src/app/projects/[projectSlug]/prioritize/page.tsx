import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"
import type { IndicatorLevel } from "@/lib/types"

import { PrioritizeView } from "./prioritize-view"

export interface PrioritizeKq {
  id: string
  kq_number: string
  question_text: string
  indicator_level_id: string
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
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const project = await getProjectBySlug(projectSlug)
  const userContext = await getCurrentUserContext()
  const role = userContext?.role ?? "client"
  const userId = userContext?.userId ?? ""
  const supabase = await createClient()

  const [{ data: keyQuestions }, { data: indicatorLevels }] =
    await Promise.all([
      supabase
        .from("key_questions")
        .select(
          "id, kq_number, question_text, indicator_level_id, priority, is_locked"
        )
        .eq("project_id", project.id),
      supabase
        .from("indicator_levels")
        .select("id, project_id, key, label, number_label, sequence")
        .eq("project_id", project.id)
        .order("sequence"),
    ])

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
      projectId={project.id}
      role={role}
      keyQuestions={(keyQuestions ?? []) as PrioritizeKq[]}
      myVotes={(myVotes ?? []) as VoteRow[]}
      allVotes={(allVotes ?? []) as VoteRow[]}
      indicatorLevels={(indicatorLevels ?? []) as IndicatorLevel[]}
    />
  )
}
