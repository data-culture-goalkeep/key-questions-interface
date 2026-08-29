"use client"

import * as React from "react"
import { ChevronDown, Lock, CheckCircle2, MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  INDICATOR_LEVELS,
  type DummyKeyQuestion,
  type Priority,
} from "@/lib/dummy-data"

function indicatorMeta(indicatorType: DummyKeyQuestion["indicatorType"]) {
  return INDICATOR_LEVELS.find((l) => l.value === indicatorType)!
}

function IndicatorDot({ chart }: { chart: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span
      className="inline-block size-2 rounded-full"
      style={{ backgroundColor: `var(--chart-${chart})` }}
    />
  )
}

const priorityVariant: Record<Priority, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

export function KqCard({
  kq,
  defaultOpen = false,
  role = "client",
  className,
}: {
  kq: DummyKeyQuestion
  defaultOpen?: boolean
  role?: "facilitator" | "client"
  className?: string
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [verified, setVerified] = React.useState(false)
  const level = indicatorMeta(kq.indicatorType)
  const openComments = kq.comments.filter((c) => c.status === "open").length

  return (
    <Card className={cn("ring-border/60", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {kq.id}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <IndicatorDot chart={level.chart} />
                    {level.label}
                  </Badge>
                  <Badge variant={priorityVariant[kq.priority]}>
                    {kq.priority} priority
                  </Badge>
                  {kq.isLocked && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="size-3" />
                      Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base leading-snug font-medium">
                  {kq.questionText}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {kq.areaOfEnquiry}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                {kq.comments.length > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <MessageSquare className="size-3.5" />
                    {kq.comments.length}
                    {openComments > 0 && (
                      <span className="text-foreground">({openComments} open)</span>
                    )}
                  </span>
                )}
                {kq.verifiedByCount > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <CheckCircle2 className="size-3.5" />
                    {kq.verifiedByCount}
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

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Indicator Definition
                </dt>
                <dd className="text-sm">{kq.indicatorDefinition}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Action
                </dt>
                <dd className="text-sm">{kq.actionText}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Primary User
                </dt>
                <dd className="text-sm">{kq.primaryUser}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  Data Availability
                </dt>
                <dd className="text-sm">{kq.dataAvailability}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground">
                  Reason for Priority
                </dt>
                <dd className="text-sm">{kq.reasonForPriority}</dd>
              </div>
            </dl>

            {kq.comments.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-sm font-medium">
                    Comments
                  </h4>
                  {kq.comments.map((c) => (
                    <div key={c.id} className="flex flex-col gap-0.5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.authorName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {c.authorRole}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {c.commentType === "definition_suggestion"
                            ? "definition suggestion"
                            : "general"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {c.createdAt}
                        </span>
                        {c.status === "open" && (
                          <Badge variant="destructive" className="text-[10px]">
                            open
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{c.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-2">
              {kq.isLocked ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  This key question is locked — facilitation is complete and
                  no further comments or verification are accepted.
                </p>
              ) : (
                <>
                  <Button variant="outline" size="sm">
                    Add comment
                  </Button>
                  {role === "client" && (
                    <Button
                      variant={verified ? "secondary" : "default"}
                      size="sm"
                      onClick={() => setVerified((v) => !v)}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5" />
                      {verified ? "Verified" : "I've read & verified this"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
