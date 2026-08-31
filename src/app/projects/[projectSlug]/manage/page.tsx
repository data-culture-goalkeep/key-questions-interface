import { redirect } from "next/navigation"

import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"

import { ManageView } from "./manage-view"

export default async function ManagePage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const [userContext, project] = await Promise.all([
    getCurrentUserContext(),
    getProjectBySlug(projectSlug),
  ])

  if (userContext?.role !== "facilitator") {
    redirect(`/projects/${projectSlug}`)
  }

  return <ManageView projectId={project.id} />
}
