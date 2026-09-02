"use client"

import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { ProfileButton } from "@/components/profile-button"
import { cn } from "@/lib/utils"

import { useProjectData } from "./project-data-provider"

// Reads from the same client-side cache as the view content, so the header
// (project name/logo/mode badge, profile button) never re-fetches on a view
// switch either — only on first load of a project or a hard refresh. Nav
// links themselves live in ProjectSidebar, which frees this bar for the
// Review hero banner underneath it on client-facing screens.
export function ProjectHeader() {
  const { data } = useProjectData()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="All projects" className="shrink-0">
            <Image
              src="/goalkeep-logo.png"
              alt="Goalkeep"
              width={116}
              height={40}
              className="h-6 w-auto"
              priority
            />
          </Link>
          {data ? (
            <div className="flex items-center gap-2">
              {data.project.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element -- logo comes from Supabase Storage, arbitrary per-project host, not worth Next/Image config for one small badge-sized image
                <img
                  src={data.project.logo_url}
                  alt=""
                  className="size-10 rounded object-contain"
                />
              )}
              <h1 className="text-base font-semibold">{data.project.name}</h1>
              <Badge variant="outline">{data.project.client_name}</Badge>
              <Badge
                className={cn(
                  "border-transparent",
                  data.project.mode === "review"
                    ? "bg-stage-input text-stage-input-fg"
                    : "bg-stage-outcome text-stage-outcome-fg"
                )}
              >
                {data.project.mode === "review" ? "Review" : "Prioritization"}
              </Badge>
            </div>
          ) : (
            <div className="h-6 w-56 animate-pulse rounded-md bg-muted" />
          )}
        </div>
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
    </header>
  )
}
