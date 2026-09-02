"use client"

import { Lock, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PriorityIndicator } from "@/components/priority-indicator"
import { cn } from "@/lib/utils"
import { stageColorsForLevel } from "@/lib/stage-colors"
import {
  indicatorLevelLabel,
  type IndicatorLevel,
  type KeyQuestion,
} from "@/lib/types"
import { KqDetailContent } from "./kq-detail-content"

// Right-side sliding panel Map view opens for a selected node, so browsing
// the results chain doesn't force a jump back to List view.
export function KqDetailPanel({
  projectId,
  kq,
  role,
  userId,
  indicatorLevels,
  onClose,
}: {
  projectId: string
  kq: KeyQuestion
  role: "facilitator" | "client"
  userId: string
  indicatorLevels: IndicatorLevel[]
  onClose: () => void
}) {
  const level = indicatorLevels.find((l) => l.id === kq.indicator_level_id)
  const stage = level ? stageColorsForLevel(level, indicatorLevels) : null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-in slide-in-from-right fade-in-0 fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-lg duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={kq.is_locked ? "secondary" : "outline"}
                className="font-mono"
              >
                {kq.kq_number}
              </Badge>
              {stage ? (
                <Badge className={cn("border-transparent", stage.bg, stage.fg)}>
                  {indicatorLevelLabel(indicatorLevels, kq.indicator_level_id)}
                </Badge>
              ) : (
                <Badge variant="outline">
                  {indicatorLevelLabel(indicatorLevels, kq.indicator_level_id)}
                </Badge>
              )}
              <PriorityIndicator priority={kq.priority} />
              {kq.is_locked && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="size-3" />
                  Locked
                </Badge>
              )}
            </div>
            <h3 className="text-base leading-snug font-medium">
              {kq.question_text}
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <KqDetailContent
            projectId={projectId}
            kq={kq}
            role={role}
            userId={userId}
          />
        </div>
      </div>
    </>
  )
}
