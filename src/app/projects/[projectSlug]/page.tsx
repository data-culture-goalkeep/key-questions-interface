import { redirect } from "next/navigation"

import { getCurrentUserContext } from "@/lib/auth"

export default async function ProjectHomePage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const userContext = await getCurrentUserContext()

  if (userContext?.role === "facilitator") {
    redirect(`/projects/${projectSlug}/manage`)
  }

  redirect(`/projects/${projectSlug}/review`)
}
