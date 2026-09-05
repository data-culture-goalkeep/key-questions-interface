"use client"

import * as React from "react"

import { PageSkeleton } from "@/components/page-skeleton"
import { getProjectData, type ProjectData } from "@/lib/project-data"

interface ProjectDataContextValue {
  data: ProjectData | null
  error: string | null
  refresh: () => Promise<void>
  // Applies `patch` to the cached data immediately — visible before the
  // mutation's network round trip completes — then runs `action` and
  // resyncs with `refresh()`. The optimistic patch is discarded once the
  // surrounding transition settles: on success `refresh()` brings in the
  // real (now-matching) data, on failure it brings back the untouched real
  // data, undoing the optimistic guess either way. Rethrows `action`'s
  // error (after refresh() has run) so callers can show their own message.
  mutate: (
    patch: (data: ProjectData) => ProjectData,
    action: () => Promise<void>
  ) => Promise<void>
}

const ProjectDataContext = React.createContext<ProjectDataContextValue | null>(
  null
)

// Reads the project + key-question data fetched once by ProjectDataProvider.
// `data` is null until the first fetch resolves (render a skeleton) or if
// `error` is set (render an error/not-found state instead). Once loaded,
// `data` stays populated — including across view switches, since the
// Provider isn't remounted — and only changes when `refresh()` is called
// after a mutation, or transiently when `mutate()`'s optimistic patch is
// showing.
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
  // Overlays an in-flight optimistic patch on top of `data`, resetting back
  // to `data` automatically once the transition that applied it settles
  // (see `mutate`). `ProjectDataGate`/`useProjectData()` hand out this
  // value, not the raw `data` state, so a view needs no changes to benefit
  // once its mutation call site switches from a bare refresh() to mutate().
  const [optimisticData, applyOptimisticPatch] = React.useOptimistic(
    data,
    (current: ProjectData | null, patch: (data: ProjectData) => ProjectData) =>
      current ? patch(current) : current
  )

  // Guards against two overlapping refresh() calls (e.g. from two quick
  // mutate() calls) resolving out of order — only the response from the
  // most recently *started* refresh() is ever applied, mirroring the
  // ignore-flag pattern the mount effect below already uses.
  const refreshSeq = React.useRef(0)

  const refresh = React.useCallback(async () => {
    const seq = ++refreshSeq.current
    try {
      const result = await getProjectData(projectSlug)
      if (seq !== refreshSeq.current) return
      if (!result) {
        setError("This project couldn't be found.")
        return
      }
      setData(result)
      setError(null)
    } catch {
      if (seq !== refreshSeq.current) return
      setError("Couldn't load this project — try refreshing the page.")
    }
  }, [projectSlug])

  const mutate = React.useCallback(
    (patch: (data: ProjectData) => ProjectData, action: () => Promise<void>) =>
      new Promise<void>((resolve, reject) => {
        // useOptimistic's dispatch must happen inside a transition — this
        // is that transition. Its async callback keeps React's pending
        // state (and the optimistic overlay) alive until refresh() below
        // resolves, whether action() succeeded or threw. resolve()/reject()
        // are called only after refresh() completes, so a caller awaiting
        // mutate() can rely on the cache actually being resynced by then —
        // e.g. a fake client-side id from an optimistic patch is guaranteed
        // to have been replaced by refresh()'s real data before anything
        // downstream (like a re-enabled button) can act on it again.
        React.startTransition(async () => {
          applyOptimisticPatch(patch)
          let actionError: unknown
          try {
            await action()
          } catch (err) {
            actionError = err
          }
          await refresh()
          if (actionError) reject(actionError)
          else resolve()
        })
      }),
    [refresh, applyOptimisticPatch]
  )

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
    () => ({ data: optimisticData, error, refresh, mutate }),
    [optimisticData, error, refresh, mutate]
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
