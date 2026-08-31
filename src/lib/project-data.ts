"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  AreaOfEnquiry,
  IndicatorLevel,
  KeyQuestion,
  KeyQuestionLink,
  VoteRow,
} from "@/lib/types"

export interface ProjectBulkData {
  areas: AreaOfEnquiry[]
  keyQuestions: KeyQuestion[]
  indicatorLevels: IndicatorLevel[]
  links: KeyQuestionLink[]
  votes: VoteRow[]
}

// Everything the Review/Manage/Prioritize views need, in one call. Fetched
// once on the client when a project's view tree mounts (see
// ProjectDataProvider) and reused across view switches — RLS already scopes
// `votes` to the caller's own rows for clients, so this can be fetched
// unconditionally rather than branching on role.
export async function getProjectBulkData(
  projectId: string
): Promise<ProjectBulkData> {
  const supabase = await createClient()

  const [{ data: areas }, { data: keyQuestions }, { data: indicatorLevels }] =
    await Promise.all([
      supabase
        .from("areas_of_enquiry")
        .select("id, project_id, name, sequence")
        .eq("project_id", projectId)
        .order("sequence"),
      supabase
        .from("key_questions")
        .select(
          "id, project_id, area_of_enquiry_id, kq_number, question_text, short_name, indicator_level_id, indicator_definition, action_text, primary_user, data_availability_status, data_availability_note, priority, reason_for_priority, sequence, is_locked, key_question_comments(id, key_question_id, author_id, author_email, comment_text, comment_type, status, created_at), key_question_client_reviews(id, key_question_id, user_id, user_email, verified_at)"
        )
        .eq("project_id", projectId)
        .order("sequence"),
      supabase
        .from("indicator_levels")
        .select("id, project_id, key, label, number_label, sequence")
        .eq("project_id", projectId)
        .order("sequence"),
    ])

  const kqIds = (keyQuestions ?? []).map((k) => k.id)

  const [{ data: links }, { data: votes }] =
    kqIds.length > 0
      ? await Promise.all([
          supabase
            .from("key_question_links")
            .select(
              "id, key_question_id_a, key_question_id_b, relationship_type"
            )
            .or(
              `key_question_id_a.in.(${kqIds.join(",")}),key_question_id_b.in.(${kqIds.join(",")})`
            ),
          supabase
            .from("key_question_priority_votes")
            .select("key_question_id, voter_id, rank_within_type")
            .in("key_question_id", kqIds),
        ])
      : [{ data: [] }, { data: [] }]

  return {
    areas: (areas ?? []) as AreaOfEnquiry[],
    keyQuestions: (keyQuestions ?? []) as unknown as KeyQuestion[],
    indicatorLevels: (indicatorLevels ?? []) as IndicatorLevel[],
    links: (links ?? []) as KeyQuestionLink[],
    votes: (votes ?? []) as VoteRow[],
  }
}
