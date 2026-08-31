import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"

import { PrioritizeView } from "./prioritize-view"

export default async function PrioritizePage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const [project, userContext] = await Promise.all([
    getProjectBySlug(projectSlug),
    getCurrentUserContext(),
  ])

  return (
    <PrioritizeView
      projectId={project.id}
      role={userContext?.role ?? "client"}
      userId={userContext?.userId ?? ""}
    />
  )
}
