"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  ListChecks,
  ListOrdered,
  Settings,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useProjectData } from "./project-data-provider"

interface NavItem {
  key: string
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// A stable portal target other project pages can render into (e.g. Review's
// filter panel) so page-specific controls live in this same persistent rail
// instead of eating a second column of horizontal space. Always present in
// the DOM (just hidden via CSS when collapsed) so a page's portal effect
// never races the rail's own collapse/expand state.
export const PROJECT_SIDEBAR_SLOT_ID = "project-sidebar-slot"

const COLLAPSE_STORAGE_KEY = "kqn-sidebar-collapsed"

// Persistent nav rail — lifted from ProjectHeader's old top-tab links, same
// mode/role gating (Review only in review mode, Prioritize only in
// prioritization mode, Manage/Configure facilitator-only) preserved
// verbatim, plus active-route highlighting the old nav never had. Renders
// as a vertical rail at sm+ and a horizontal scrollable row below it, so
// mobile keeps a working nav rather than losing it entirely.
export function ProjectSidebar({ projectSlug }: { projectSlug: string }) {
  const { data } = useProjectData()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    // Deliberately deferred to an effect rather than a lazy useState
    // initializer: reading localStorage during the initial client render
    // would desync from the server-rendered (collapsed=false) markup and
    // trigger a hydration mismatch. This runs once, post-hydration.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1") setCollapsed(true)
    } catch {
      // localStorage unavailable (private mode, etc.) — default expanded.
    }
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0")
      } catch {
        // ignore — collapse still works for this session, just not remembered
      }
      return next
    })
  }

  if (!data) {
    return <div className="h-12 w-full shrink-0 sm:h-auto sm:w-56" />
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
    <div
      className={cn(
        "flex w-full shrink-0 flex-col border-b border-border sm:border-r sm:border-b-0 sm:self-start",
        "sm:sticky sm:top-4 sm:max-h-[calc(100svh-2rem)] sm:overflow-y-auto",
        collapsed ? "sm:w-14" : "sm:w-56"
      )}
    >
      <nav className="flex flex-row items-center gap-1 overflow-x-auto px-2 py-2 sm:flex-col sm:items-stretch sm:overflow-visible sm:px-2 sm:py-4">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href) ?? false
          const Icon = item.icon
          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                collapsed && "sm:justify-center sm:px-0",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className={collapsed ? "sm:hidden" : undefined}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground sm:flex sm:justify-center"
      >
        {collapsed ? (
          <ChevronsRight className="size-3.5" />
        ) : (
          <>
            <ChevronsLeft className="size-3.5" />
            Collapse
          </>
        )}
      </button>

      <div
        id={PROJECT_SIDEBAR_SLOT_ID}
        className={cn("flex flex-col gap-4 border-t border-border p-3", collapsed && "hidden")}
      />
    </div>
  )
}
