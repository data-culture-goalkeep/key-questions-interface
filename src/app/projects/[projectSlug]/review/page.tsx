import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"
import type {
  AreaOfEnquiry,
  IndicatorLevel,
  KeyQuestion,
  KeyQuestionLink,
} from "@/lib/types"

import { ReviewShell } from "./review-shell"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const project = await getProjectBySlug(projectSlug)
  const userContext = await getCurrentUserContext()
  const supabase = await createClient()

  const [{ data: areas }, { data: keyQuestions }, { data: indicatorLevels }] =
    await Promise.all([
      supabase
        .from("areas_of_enquiry")
        .select("id, project_id, name, sequence")
        .eq("project_id", project.id)
        .order("sequence"),
      supabase
        .from("key_questions")
        .select(
          "id, project_id, area_of_enquiry_id, kq_number, question_text, short_name, indicator_level_id, indicator_definition, action_text, primary_user, data_availability_status, data_availability_note, priority, reason_for_priority, sequence, is_locked, key_question_comments(id, key_question_id, author_id, author_email, comment_text, comment_type, status, created_at), key_question_client_reviews(id, key_question_id, user_id, user_email, verified_at)"
        )
        .eq("project_id", project.id)
        .order("sequence"),
      supabase
        .from("indicator_levels")
        .select("id, project_id, key, label, number_label, sequence")
        .eq("project_id", project.id)
        .order("sequence"),
    ])

  const kqIds = (keyQuestions ?? []).map((k) => k.id)
  const { data: links } =
    kqIds.length > 0
      ? await supabase
          .from("key_question_links")
          .select("id, key_question_id_a, key_question_id_b, relationship_type")
          .or(
            `key_question_id_a.in.(${kqIds.join(",")}),key_question_id_b.in.(${kqIds.join(",")})`
          )
      : { data: [] }

  return (
    <ReviewShell
      projectId={project.id}
      userId={userContext?.userId ?? ""}
      role={userContext?.role ?? "client"}
      areas={(areas ?? []) as AreaOfEnquiry[]}
      keyQuestions={(keyQuestions ?? []) as unknown as KeyQuestion[]}
      links={(links ?? []) as KeyQuestionLink[]}
      indicatorLevels={(indicatorLevels ?? []) as IndicatorLevel[]}
    />
  )
}
