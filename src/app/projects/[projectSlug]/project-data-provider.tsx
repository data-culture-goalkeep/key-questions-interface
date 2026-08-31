"use client"

import * as React from "react"

import { PageSkeleton } from "@/components/page-skeleton"
import { getProjectData, type ProjectData } from "@/lib/project-data"

interface ProjectDataContextValue {
  data: ProjectData | null
  error: string | null
  refresh: () => Promise<void>
}

const ProjectDataContext = React.createContext<ProjectDataContextValue | null>(
  null
)

// Reads the project + key-question data fetched once by ProjectDataProvider.
// `data` is null until the first fetch resolves (render a skeleton) or if
// `error` is set (render an error/not-found state instead). Once loaded,
// `data` stays populated — including across view switches, since the
// Provider isn't remounted — and only changes when `refresh()` is called
// after a mutation.
export function useProjectData() {
  const ctx = React.useContext(ProjectDataContext)
  if (!ctx) {
    throw new Error("useProjectData must be used within a ProjectDataProvider")
  }
  return ctx
}

export function ProjectDataProvider({
  projectSlug,
  children,
}: {
  projectSlug: string
  children: React.ReactNode
}) {
  const [data, setData] = React.useState<ProjectData | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    try {
      const result = await getProjectData(projectSlug)
      if (!result) {
        setError("This project couldn't be found.")
        return
      }
      setData(result)
      setError(null)
    } catch {
      setError("Couldn't load this project — try refreshing the page.")
    }
  }, [projectSlug])

  // Fires once per distinct projectSlug, not on every view switch — this
  // component instance persists across client-side navigation between
  // sibling routes under the same project layout. Written inline (rather
  // than calling refresh()) with an ignore flag per React's documented
  // fetch-in-effect pattern, so a superseded request can't clobber state
  // after a newer one already landed.
  React.useEffect(() => {
    let ignore = false
    getProjectData(projectSlug).then(
      (result) => {
        if (ignore) return
        if (!result) {
          setError("This project couldn't be found.")
          return
        }
        setData(result)
        setError(null)
      },
      () => {
        if (ignore) return
        setError("Couldn't load this project — try refreshing the page.")
      }
    )
    return () => {
      ignore = true
    }
  }, [projectSlug])

  const value = React.useMemo(
    () => ({ data, error, refresh }),
    [data, error, refresh]
  )

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  )
}

// Shared loading/error boilerplate for the four view components — renders
// a skeleton until data arrives, an error message if the fetch failed or
// the project wasn't found, and otherwise hands the loaded data to the
// render prop.
export function ProjectDataGate({
  children,
  skeletonRows = 5,
}: {
  children: (data: ProjectData) => React.ReactNode
  skeletonRows?: number
}) {
  const { data, error } = useProjectData()

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!data) return <PageSkeleton rows={skeletonRows} />

  return <>{children(data)}</>
}
