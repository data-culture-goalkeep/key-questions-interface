"use client"

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AreaOfEnquiry, KeyQuestion, KeyQuestionLink } from "@/lib/types"

import { ListView } from "./list-view"
import { MapView } from "./map-view"

export function ReviewShell({
  projectId,
  userId,
  role,
  areas,
  keyQuestions,
  links,
}: {
  projectId: string
  userId: string
  role: "facilitator" | "client"
  areas: AreaOfEnquiry[]
  keyQuestions: KeyQuestion[]
  links: KeyQuestionLink[]
}) {
  const [activeTab, setActiveTab] = React.useState("list")
  const [selectedKqId, setSelectedKqId] = React.useState<string | null>(null)

  function selectAndShowInList(kqId: string) {
    setSelectedKqId(kqId)
    setActiveTab("list")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Review key questions</h2>
        <p className="text-sm text-muted-foreground">
          Switch between the full list and the results-chain map — your
          place is kept when you switch.
        </p>
      </div>

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
            keyQuestions={keyQuestions}
            selectedKqId={selectedKqId}
            onSelectKq={setSelectedKqId}
          />
        </TabsContent>

        <TabsContent value="map" className="pt-4">
          <MapView
            keyQuestions={keyQuestions}
            links={links}
            selectedKqId={selectedKqId}
            onSelectKq={selectAndShowInList}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
