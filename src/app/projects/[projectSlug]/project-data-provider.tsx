"use client"

import * as React from "react"

import { getProjectBulkData, type ProjectBulkData } from "@/lib/project-data"

interface ProjectDataContextValue {
  data: ProjectBulkData | null
  error: string | null
  refresh: () => Promise<void>
}

const ProjectDataContext = React.createContext<ProjectDataContextValue | null>(
  null
)

// Reads the bulk key-question data fetched once by ProjectDataProvider.
// `data` is null only until the first fetch resolves — callers should
// render a skeleton in that case. After that, `data` stays populated
// (including across view switches, since the Provider isn't remounted)
// and only changes when `refresh()` is called after a mutation.
export function useProjectData() {
  const ctx = React.useContext(ProjectDataContext)
  if (!ctx) {
    throw new Error("useProjectData must be used within a ProjectDataProvider")
  }
  return ctx
}

export function ProjectDataProvider({
  projectId,
  children,
}: {
  projectId: string
  children: React.ReactNode
}) {
  const [data, setData] = React.useState<ProjectBulkData | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    try {
      const result = await getProjectBulkData(projectId)
      setData(result)
      setError(null)
    } catch {
      setError("Couldn't load this project's data — try refreshing the page.")
    }
  }, [projectId])

  // Fires once per distinct projectId, not on every view switch — this
  // component instance persists across client-side navigation between
  // sibling routes under the same project layout. Written inline (rather
  // than calling refresh()) with an ignore flag per React's documented
  // fetch-in-effect pattern, so a superseded request can't clobber state
  // after a newer one already landed.
  React.useEffect(() => {
    let ignore = false
    getProjectBulkData(projectId).then(
      (result) => {
        if (ignore) return
        setData(result)
        setError(null)
      },
      () => {
        if (ignore) return
        setError("Couldn't load this project's data — try refreshing the page.")
      }
    )
    return () => {
      ignore = true
    }
  }, [projectId])

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
