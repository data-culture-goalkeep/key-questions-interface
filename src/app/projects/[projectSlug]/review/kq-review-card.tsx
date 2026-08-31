"use client"

import { CheckCircle2, ChevronDown, Lock, MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  indicatorLevelLabel,
  priorityLabel,
  PRIORITY_BADGE_VARIANT,
  type IndicatorLevel,
  type KeyQuestion,
} from "@/lib/types"
import { KqDetailContent } from "./kq-detail-content"

export function KqReviewCard({
  projectId,
  kq,
  role,
  userId,
  indicatorLevels,
  open,
  onOpenChange,
}: {
  projectId: string
  kq: KeyQuestion
  role: "facilitator" | "client"
  userId: string
  indicatorLevels: IndicatorLevel[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const commentCount = kq.key_question_comments?.length ?? 0
  const openComments =
    kq.key_question_comments?.filter((c) => c.status === "open").length ?? 0
  const verifiedCount = kq.key_question_client_reviews?.length ?? 0

  return (
    <Card
      id={`kq-${kq.id}`}
      className={cn(
        "ring-border/60 scroll-mt-24",
        open && "ring-2 ring-ring",
        kq.is_locked && "border-muted-foreground/40"
      )}
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={kq.is_locked ? "secondary" : "outline"}
                    className="font-mono"
                  >
                    {kq.kq_number}
                  </Badge>
                  <Badge variant="outline">
                    {indicatorLevelLabel(indicatorLevels, kq.indicator_level_id)}
                  </Badge>
                  <Badge variant={PRIORITY_BADGE_VARIANT[kq.priority]}>
                    {priorityLabel(kq.priority)}
                  </Badge>
                  {kq.is_locked && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="size-3" />
                      Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base leading-snug font-medium">
                  {kq.question_text}
                </CardTitle>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                {commentCount > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <MessageSquare className="size-3.5" />
                    {commentCount}
                    {openComments > 0 && (
                      <span className="text-foreground">
                        ({openComments} open)
                      </span>
                    )}
                  </span>
                )}
                {verifiedCount > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <CheckCircle2 className="size-3.5" />
                    {verifiedCount}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    open && "rotate-180"
                  )}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="flex flex-col gap-4 pt-1">
            <Separator />
            <KqDetailContent
              projectId={projectId}
              kq={kq}
              role={role}
              userId={userId}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
