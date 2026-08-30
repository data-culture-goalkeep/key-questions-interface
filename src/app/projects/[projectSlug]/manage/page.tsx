import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"
import type { AreaOfEnquiry, IndicatorLevel, KeyQuestion } from "@/lib/types"

import { ManageView } from "./manage-view"

export default async function ManagePage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const userContext = await getCurrentUserContext()

  if (userContext?.role !== "facilitator") {
    redirect(`/projects/${projectSlug}`)
  }

  const project = await getProjectBySlug(projectSlug)
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
          "id, project_id, area_of_enquiry_id, kq_number, question_text, short_name, indicator_level_id, indicator_definition, action_text, primary_user, data_availability_status, data_availability_note, priority, reason_for_priority, sequence, is_locked"
        )
        .eq("project_id", project.id)
        .order("sequence"),
      supabase
        .from("indicator_levels")
        .select("id, project_id, key, label, number_label, sequence")
        .eq("project_id", project.id)
        .order("sequence"),
    ])

  return (
    <ManageView
      projectId={project.id}
      initialAreas={(areas ?? []) as AreaOfEnquiry[]}
      initialKeyQuestions={(keyQuestions ?? []) as KeyQuestion[]}
      indicatorLevels={(indicatorLevels ?? []) as IndicatorLevel[]}
    />
  )
}
