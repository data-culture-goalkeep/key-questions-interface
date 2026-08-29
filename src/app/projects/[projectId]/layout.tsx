import Link from "next/link"
import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const userContext = await getCurrentUserContext()
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, client_name, status")
    .eq("id", projectId)
    .single()

  if (!project) notFound()

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-xs text-muted-foreground underline">
              All projects
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <Badge variant="outline">{project.client_name}</Badge>
            </div>
          </div>
          {userContext?.role === "facilitator" && (
            <nav className="flex gap-4 text-sm">
              <Link
                href={`/projects/${projectId}/manage`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Manage
              </Link>
            </nav>
          )}
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </div>
    </div>
  )
}
