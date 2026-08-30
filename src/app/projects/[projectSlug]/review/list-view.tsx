"use client"

import * as React from "react"

import type { AreaOfEnquiry, IndicatorLevel, KeyQuestion } from "@/lib/types"
import { KqReviewCard } from "./kq-review-card"

export function ListView({
  projectId,
  userId,
  role,
  areas,
  keyQuestions,
  indicatorLevels,
  selectedKqId,
  focusToken,
  onSelectKq,
}: {
  projectId: string
  userId: string
  role: "facilitator" | "client"
  areas: AreaOfEnquiry[]
  keyQuestions: KeyQuestion[]
  indicatorLevels: IndicatorLevel[]
  selectedKqId: string | null
  focusToken?: number
  onSelectKq: (kqId: string | null) => void
}) {
  React.useEffect(() => {
    if (!selectedKqId) return
    const el = document.getElementById(`kq-${selectedKqId}`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
    // focusToken changes on every map-node click, including re-clicking the
    // already-selected node, so this re-scrolls even when selectedKqId
    // itself didn't change.
  }, [selectedKqId, focusToken])

  const kqsByArea = React.useMemo(() => {
    const map = new Map<string, KeyQuestion[]>()
    for (const kq of keyQuestions) {
      const list = map.get(kq.area_of_enquiry_id) ?? []
      list.push(kq)
      map.set(kq.area_of_enquiry_id, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.sequence - b.sequence)
    return map
  }, [keyQuestions])

  if (areas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No key questions yet for this project.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {areas.map((area) => {
        const kqs = kqsByArea.get(area.id) ?? []
        if (kqs.length === 0) return null
        return (
          <div key={area.id} className="flex flex-col gap-3">
            <h3 className="font-heading text-base font-semibold">
              {area.name}
            </h3>
            <div className="flex flex-col gap-3">
              {kqs.map((kq) => (
                <KqReviewCard
                  key={kq.id}
                  projectId={projectId}
                  kq={kq}
                  role={role}
                  userId={userId}
                  indicatorLevels={indicatorLevels}
                  open={selectedKqId === kq.id}
                  onOpenChange={(open) => onSelectKq(open ? kq.id : null)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
