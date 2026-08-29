import { redirect } from "next/navigation"

import { getCurrentUserContext } from "@/lib/auth"

export default async function ProjectHomePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const userContext = await getCurrentUserContext()

  if (userContext?.role === "facilitator") {
    redirect(`/projects/${projectId}/manage`)
  }

  return (
    <p className="text-sm text-muted-foreground">
      Review mode isn&apos;t built yet — check back soon.
    </p>
  )
}
