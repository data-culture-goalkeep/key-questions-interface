import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import type { AreaOfEnquiry, KeyQuestion, KeyQuestionLink } from "@/lib/types"

import { ReviewShell } from "./review-shell"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const userContext = await getCurrentUserContext()
  const supabase = await createClient()

  const [{ data: areas }, { data: keyQuestions }] = await Promise.all([
    supabase
      .from("areas_of_enquiry")
      .select("id, project_id, name, sequence")
      .eq("project_id", projectId)
      .order("sequence"),
    supabase
      .from("key_questions")
      .select(
        "id, project_id, area_of_enquiry_id, kq_number, question_text, indicator_type, indicator_definition, action_text, primary_user, data_availability, priority, reason_for_priority, sequence, is_locked, key_question_comments(id, key_question_id, author_id, author_email, comment_text, comment_type, status, created_at), key_question_client_reviews(id, key_question_id, user_id, user_email, verified_at)"
      )
      .eq("project_id", projectId)
      .order("sequence"),
  ])

  const kqIds = (keyQuestions ?? []).map((k) => k.id)
  const { data: links } =
    kqIds.length > 0
      ? await supabase
          .from("key_question_links")
          .select("id, key_question_id_a, key_question_id_b, relationship_type")
          .in("key_question_id_a", kqIds)
      : { data: [] }

  return (
    <ReviewShell
      projectId={projectId}
      userId={userContext?.userId ?? ""}
      role={userContext?.role ?? "client"}
      areas={(areas ?? []) as AreaOfEnquiry[]}
      keyQuestions={(keyQuestions ?? []) as unknown as KeyQuestion[]}
      links={(links ?? []) as KeyQuestionLink[]}
    />
  )
}
