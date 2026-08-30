import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"
import type { IndicatorLevel } from "@/lib/types"

import { ConfigureView } from "./configure-view"

export default async function ConfigurePage({
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

  const { data: indicatorLevels } = await supabase
    .from("indicator_levels")
    .select("id, project_id, key, label, number_label, sequence")
    .eq("project_id", project.id)
    .order("sequence")

  return (
    <ConfigureView
      project={project}
      indicatorLevels={(indicatorLevels ?? []) as IndicatorLevel[]}
    />
  )
}
