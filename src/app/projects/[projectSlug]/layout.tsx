import Link from "next/link"

import { getCurrentUserContext } from "@/lib/auth"
import { getProjectBySlug } from "@/lib/projects"
import { Badge } from "@/components/ui/badge"
import { ProfileButton } from "@/components/profile-button"
import { ProjectDataProvider } from "./project-data-provider"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params
  const [userContext, project] = await Promise.all([
    getCurrentUserContext(),
    getProjectBySlug(projectSlug),
  ])

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-xs text-muted-foreground underline">
              All projects
            </Link>
            <div className="flex items-center gap-2">
              {project.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element -- logo comes from Supabase Storage, arbitrary per-project host, not worth Next/Image config for one small badge-sized image
                <img
                  src={project.logo_url}
                  alt=""
                  className="size-6 rounded object-contain"
                />
              )}
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <Badge variant="outline">{project.client_name}</Badge>
              <Badge variant="secondary">
                {project.mode === "review" ? "Review" : "Prioritization"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-4 text-sm">
              <Link
                href={`/projects/${projectSlug}/review`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Review
              </Link>
              <Link
                href={`/projects/${projectSlug}/prioritize`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Prioritize
              </Link>
              {userContext?.role === "facilitator" && (
                <>
                  <Link
                    href={`/projects/${projectSlug}/manage`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/projects/${projectSlug}/configure`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Configure
                  </Link>
                </>
              )}
            </nav>
            {userContext && <ProfileButton userContext={userContext} />}
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <ProjectDataProvider projectId={project.id}>
          {children}
        </ProjectDataProvider>
      </div>
    </div>
  )
}
