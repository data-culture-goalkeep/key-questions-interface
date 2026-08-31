import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"

import { ReviewShell } from "./review-shell"

export default async function ReviewPage({
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
    <ReviewShell
      projectId={project.id}
      userId={userContext?.userId ?? ""}
      role={userContext?.role ?? "client"}
    />
  )
}
