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

  redirect(`/projects/${projectId}/review`)
}
