"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  AreaOfEnquiry,
  IndicatorLevel,
  KeyQuestion,
  KeyQuestionLink,
} from "@/lib/types"

import { ProjectDataGate } from "../project-data-provider"
import { EMPTY_KQ_FILTERS, KqFiltersPanel, type KqFilters } from "../kq-filters-panel"
import { KqDetailPanel } from "./kq-detail-panel"
import { ListView } from "./list-view"
import { MapView } from "./map-view"
import { ReviewHero } from "./review-hero"

export function ReviewShell() {
  return (
    <ProjectDataGate skeletonRows={6}>
      {(data) => (
        <ReviewShellInner
          projectId={data.project.id}
          userId={data.userId}
          role={data.role}
          areas={data.areas}
          keyQuestions={data.keyQuestions}
          links={data.links}
          indicatorLevels={data.indicatorLevels}
        />
      )}
    </ProjectDataGate>
  )
}

function ReviewShellInner({
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

  const [filters, setFilters] = React.useState<KqFilters>(EMPTY_KQ_FILTERS)

  const filteredKeyQuestions = React.useMemo(() => {
    const titleQuery = filters.titleQuery.trim().toLowerCase()
    return keyQuestions.filter((kq) => {
      if (titleQuery && !kq.question_text.toLowerCase().includes(titleQuery)) {
        return false
      }
      if (filters.levelId && kq.indicator_level_id !== filters.levelId) {
        return false
      }
      if (filters.priority && kq.priority !== filters.priority) return false
      if (filters.areaId && kq.area_of_enquiry_id !== filters.areaId) {
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

  const detailKq = detailPanelKqId
    ? (keyQuestions.find((kq) => kq.id === detailPanelKqId) ?? null)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-3xl font-semibold">
          Review key questions
        </h2>
        <p className="text-sm text-muted-foreground">
          Switch between the full list and the results-chain map — your
          place is kept when you switch.
        </p>
      </div>

      <ReviewHero keyQuestions={keyQuestions} indicatorLevels={indicatorLevels} />

      {/* Renders nothing here — portals its content into the persistent
          left nav rail (ProjectSidebar) so filters live in one left-hand
          region instead of a second column competing for space. */}
      <KqFiltersPanel
        areas={areas}
        indicatorLevels={indicatorLevels}
        filters={filters}
        onFiltersChange={setFilters}
      />

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
            titleQuery={filters.titleQuery}
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
