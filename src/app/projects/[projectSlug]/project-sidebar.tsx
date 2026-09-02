"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, ListChecks, ListOrdered, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { useProjectData } from "./project-data-provider"

interface NavItem {
  key: string
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Persistent nav rail — lifted from ProjectHeader's old top-tab links, same
// mode/role gating (Review only in review mode, Prioritize only in
// prioritization mode, Manage/Configure facilitator-only) preserved
// verbatim, plus active-route highlighting the old nav never had. Renders
// as a vertical rail at sm+ and a horizontal scrollable row below it, so
// mobile keeps a working nav rather than losing it entirely.
export function ProjectSidebar({ projectSlug }: { projectSlug: string }) {
  const { data } = useProjectData()
  const pathname = usePathname()

  if (!data) {
    return <div className="h-12 w-full shrink-0 sm:h-auto sm:w-48" />
  }

  const items: NavItem[] = []
  if (data.project.mode === "review") {
    items.push({
      key: "review",
      href: `/projects/${projectSlug}/review`,
      label: "Review",
      icon: ListChecks,
    })
  }
  if (data.project.mode === "prioritization") {
    items.push({
      key: "prioritize",
      href: `/projects/${projectSlug}/prioritize`,
      label: "Prioritize",
      icon: ListOrdered,
    })
  }
  if (data.role === "facilitator") {
    items.push({
      key: "manage",
      href: `/projects/${projectSlug}/manage`,
      label: "Manage",
      icon: ClipboardList,
    })
    items.push({
      key: "configure",
      href: `/projects/${projectSlug}/configure`,
      label: "Configure",
      icon: Settings,
    })
  }

  return (
    <nav className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-border px-2 py-2 sm:w-48 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0 sm:px-2 sm:py-4">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href) ?? false
        const Icon = item.icon
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
