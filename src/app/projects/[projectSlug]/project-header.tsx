"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { ProfileButton } from "@/components/profile-button"

import { useProjectData } from "./project-data-provider"

// Reads from the same client-side cache as the view content, so the header
// (project name/logo/mode badge, facilitator-only nav links, profile
// button) never re-fetches on a view switch either — only on first load of
// a project or a hard refresh.
export function ProjectHeader({ projectSlug }: { projectSlug: string }) {
  const { data } = useProjectData()

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-xs text-muted-foreground underline">
            All projects
          </Link>
          {data ? (
            <div className="flex items-center gap-2">
              {data.project.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element -- logo comes from Supabase Storage, arbitrary per-project host, not worth Next/Image config for one small badge-sized image
                <img
                  src={data.project.logo_url}
                  alt=""
                  className="size-6 rounded object-contain"
                />
              )}
              <h1 className="text-lg font-semibold">{data.project.name}</h1>
              <Badge variant="outline">{data.project.client_name}</Badge>
              <Badge variant="secondary">
                {data.project.mode === "review" ? "Review" : "Prioritization"}
              </Badge>
            </div>
          ) : (
            <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
          )}
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 text-sm">
            {data?.project.mode === "review" && (
              <Link
                href={`/projects/${projectSlug}/review`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Review
              </Link>
            )}
            {data?.project.mode === "prioritization" && (
              <Link
                href={`/projects/${projectSlug}/prioritize`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Prioritize
              </Link>
            )}
            {data?.role === "facilitator" && (
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
          {data && (
            <ProfileButton
              userContext={{
                role: data.role,
                email: data.userEmail,
                userId: data.userId,
                avatarUrl: data.avatarUrl,
                fullName: data.fullName,
                expiresAt: data.expiresAt,
              }}
            />
          )}
        </div>
      </div>
    </header>
  )
}
