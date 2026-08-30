"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  AreaOfEnquiry,
  IndicatorLevel,
  KeyQuestion,
  KeyQuestionLink,
} from "@/lib/types"

import { KqDetailPanel } from "./kq-detail-panel"
import { ListView } from "./list-view"
import { MapView } from "./map-view"
import { ReviewSidebar, type ReviewFilters } from "./review-sidebar"

export function ReviewShell({
  projectId,
  userId,
  role,
  areas,
  keyQuestions,
  links,
  indicatorLevels,
}: {
  projectId: string
  userId: string
  role: "facilitator" | "client"
  areas: AreaOfEnquiry[]
  keyQuestions: KeyQuestion[]
  links: KeyQuestionLink[]
  indicatorLevels: IndicatorLevel[]
}) {
  const [activeTab, setActiveTab] = React.useState("list")
  const [selectedKqId, setSelectedKqId] = React.useState<string | null>(null)
  const [detailPanelKqId, setDetailPanelKqId] = React.useState<string | null>(
    null
  )
  // Bumped on every map-node selection, even re-selecting the same node, so
  // ListView's scroll-into-view effect (keyed on selectedKqId alone) can't
  // miss a change that leaves selectedKqId unchanged, and so switching to
  // List after a Map selection scrolls to it even though selectedKqId
  // didn't change in that moment.
  const [focusToken, setFocusToken] = React.useState(0)

  const [filters, setFilters] = React.useState<ReviewFilters>({
    levelIds: new Set(),
    priorities: new Set(),
    lockFilter: "all",
  })

  const filteredKeyQuestions = React.useMemo(() => {
    return keyQuestions.filter((kq) => {
      if (filters.levelIds.size > 0 && !filters.levelIds.has(kq.indicator_level_id)) {
        return false
      }
      if (filters.priorities.size > 0 && !filters.priorities.has(kq.priority)) {
        return false
      }
      if (filters.lockFilter === "locked" && !kq.is_locked) return false
      if (filters.lockFilter === "unlocked" && kq.is_locked) return false
      return true
    })
  }, [keyQuestions, filters])

  function selectFromMap(kqId: string | null) {
    setSelectedKqId(kqId)
    setFocusToken((t) => t + 1)
  }

  function jumpToArea(areaId: string) {
    setActiveTab("list")
    // Wait for the List tab's content to mount before scrolling to it.
    requestAnimationFrame(() => {
      document
        .getElementById(`area-${areaId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const detailKq = detailPanelKqId
    ? (keyQuestions.find((kq) => kq.id === detailPanelKqId) ?? null)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Review key questions</h2>
        <p className="text-sm text-muted-foreground">
          Switch between the full list and the results-chain map — your
          place is kept when you switch.
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <ReviewSidebar
          areas={areas}
          indicatorLevels={indicatorLevels}
          filters={filters}
          onFiltersChange={setFilters}
          onJumpToArea={jumpToArea}
        />

        <div className="min-w-0 flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="pt-4">
              <ListView
                projectId={projectId}
                userId={userId}
                role={role}
                areas={areas}
                keyQuestions={filteredKeyQuestions}
                indicatorLevels={indicatorLevels}
                selectedKqId={selectedKqId}
                focusToken={focusToken}
                onSelectKq={setSelectedKqId}
              />
            </TabsContent>

            <TabsContent value="map" className="pt-4">
              <MapView
                keyQuestions={filteredKeyQuestions}
                links={links}
                indicatorLevels={indicatorLevels}
                selectedKqId={selectedKqId}
                onSelectKq={selectFromMap}
                onOpenDetail={setDetailPanelKqId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {detailKq && (
        <KqDetailPanel
          projectId={projectId}
          kq={detailKq}
          role={role}
          userId={userId}
          indicatorLevels={indicatorLevels}
          onClose={() => setDetailPanelKqId(null)}
        />
      )}
    </div>
  )
}
