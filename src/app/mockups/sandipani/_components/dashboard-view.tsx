"use client"

import * as React from "react"

import { buildView } from "@/lib/mockup/build-view"
import { viewById } from "@/lib/mockup/content/views"

import { useMockup } from "../mockup-provider"
import { OverallFeedback } from "./overall-feedback"
import { Sections } from "./sections"

export function DashboardView({ viewId }: { viewId: string }) {
  const mk = useMockup()
  const view = viewById(viewId)
  const { setFocus } = mk

  // Clear any focused element when the view changes.
  React.useEffect(() => {
    setFocus(null)
  }, [viewId, setFocus])

  const sections = React.useMemo(
    () => buildView(viewId, mk.filtersForView(viewId)),
    [viewId, mk],
  )

  if (!view) return null

  return (
    <>
      <Sections sections={sections} viewId={viewId} />
      {view.last && <OverallFeedback />}
    </>
  )
}
