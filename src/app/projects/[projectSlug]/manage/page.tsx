import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import type { AreaOfEnquiry, KeyQuestion } from "@/lib/types"

import { ManageView } from "./manage-view"

export default async function ManagePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const userContext = await getCurrentUserContext()

  if (userContext?.role !== "facilitator") {
    redirect(`/projects/${projectId}`)
  }

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
        "id, project_id, area_of_enquiry_id, kq_number, question_text, indicator_type, indicator_definition, action_text, primary_user, data_availability, priority, reason_for_priority, sequence, is_locked"
      )
      .eq("project_id", projectId)
      .order("sequence"),
  ])

  return (
    <ManageView
      projectId={projectId}
      initialAreas={(areas ?? []) as AreaOfEnquiry[]}
      initialKeyQuestions={(keyQuestions ?? []) as KeyQuestion[]}
    />
  )
}
