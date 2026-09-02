"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"

import { Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { stageColorsForLevel } from "@/lib/stage-colors"
import {
  DATA_AVAILABILITY_STATUSES,
  PRIORITIES,
  type AreaOfEnquiry,
  type IndicatorLevel,
  type KeyQuestion,
} from "@/lib/types"
import type { KeyQuestionInput } from "./actions"

function FormSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h4>
  )
}

function emptyForm(defaultIndicatorLevelId: string): KeyQuestionInput {
  return {
    areaOfEnquiryId: "",
    kqNumber: "",
    questionText: "",
    shortName: "",
    indicatorLevelId: defaultIndicatorLevelId,
    indicatorDefinition: "",
    actionText: "",
    primaryUser: "",
    dataAvailabilityStatus: "fully_available",
    dataAvailabilityNote: "",
    priority: "medium",
    reasonForPriority: "",
    dependsOnKqIds: [],
  }
}

function toForm(kq: KeyQuestion, dependsOnKqIds: string[]): KeyQuestionInput {
  return {
    areaOfEnquiryId: kq.area_of_enquiry_id,
    kqNumber: kq.kq_number,
    questionText: kq.question_text,
    shortName: kq.short_name,
    indicatorLevelId: kq.indicator_level_id,
    indicatorDefinition: kq.indicator_definition,
    actionText: kq.action_text,
    primaryUser: kq.primary_user,
    dataAvailabilityStatus: kq.data_availability_status,
    dataAvailabilityNote: kq.data_availability_note,
    priority: kq.priority,
    reasonForPriority: kq.reason_for_priority,
    dependsOnKqIds,
  }
}

export function KqFormDialog({
  areas,
  indicatorLevels,
  allKeyQuestions,
  keyQuestion,
  initialDependsOnKqIds,
  defaultAreaId,
  trigger,
  onSubmit,
}: {
  areas: AreaOfEnquiry[]
  indicatorLevels: IndicatorLevel[]
  // Candidates for the "Depends on" picker — every other KQ in the
  // project, filtered below to indicator levels at or before this KQ's own.
  allKeyQuestions: KeyQuestion[]
  keyQuestion?: KeyQuestion
  initialDependsOnKqIds?: string[]
  defaultAreaId?: string
  trigger: React.ReactNode
  onSubmit: (input: KeyQuestionInput) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<KeyQuestionInput>(
    keyQuestion
      ? toForm(keyQuestion, initialDependsOnKqIds ?? [])
      : {
          ...emptyForm(indicatorLevels[0]?.id ?? ""),
          areaOfEnquiryId: defaultAreaId ?? "",
        }
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof KeyQuestionInput>(key: K, value: KeyQuestionInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const levelSequenceById = React.useMemo(
    () => new Map(indicatorLevels.map((l) => [l.id, l.sequence])),
    [indicatorLevels]
  )

  // Switching to an earlier indicator level can put a previously-selected
  // dependency out of range — drop it rather than carry a hidden selection
  // the picker no longer shows.
  function setIndicatorLevel(newLevelId: string) {
    const newSequence = levelSequenceById.get(newLevelId) ?? Infinity
    setForm((f) => ({
      ...f,
      indicatorLevelId: newLevelId,
      dependsOnKqIds: f.dependsOnKqIds.filter((id) => {
        const kq = allKeyQuestions.find((k) => k.id === id)
        const sequence = kq
          ? (levelSequenceById.get(kq.indicator_level_id) ?? Infinity)
          : Infinity
        return sequence <= newSequence
      }),
    }))
  }

  function toggleDependsOn(kqId: string) {
    setForm((f) => ({
      ...f,
      dependsOnKqIds: f.dependsOnKqIds.includes(kqId)
        ? f.dependsOnKqIds.filter((id) => id !== kqId)
        : [...f.dependsOnKqIds, kqId],
    }))
  }

  const currentLevelSequence =
    levelSequenceById.get(form.indicatorLevelId) ?? Infinity
  const dependsOnCandidatesByLevel = React.useMemo(() => {
    const map = new Map<string, KeyQuestion[]>()
    for (const kq of allKeyQuestions) {
      if (keyQuestion && kq.id === keyQuestion.id) continue
      const sequence = levelSequenceById.get(kq.indicator_level_id) ?? Infinity
      if (sequence > currentLevelSequence) continue
      const list = map.get(kq.indicator_level_id) ?? []
      list.push(kq)
      map.set(kq.indicator_level_id, list)
    }
    return map
  }, [allKeyQuestions, keyQuestion, levelSequenceById, currentLevelSequence])
  const sortedLevelsForPicker = [...indicatorLevels].sort(
    (a, b) => a.sequence - b.sequence
  )

  const [previewDefinition, setPreviewDefinition] = React.useState(false)
  const needsAvailabilityNote = form.dataAvailabilityStatus !== "fully_available"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {keyQuestion ? `Edit ${keyQuestion.kq_number}` : "Add key question"}
            </DialogTitle>
            <DialogDescription>
              Fields match the original KQ spreadsheet columns.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <FormSectionHeading>Identity</FormSectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="kqNumber">KQ number</Label>
                <Input
                  id="kqNumber"
                  required
                  value={form.kqNumber}
                  onChange={(e) => set("kqNumber", e.target.value)}
                  placeholder="KQ01"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="areaOfEnquiryId">Area of enquiry</Label>
                <Select
                  value={form.areaOfEnquiryId}
                  onValueChange={(v) => set("areaOfEnquiryId", v)}
                >
                  <SelectTrigger id="areaOfEnquiryId" className="w-full">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="questionText">Key question</Label>
                <Textarea
                  id="questionText"
                  required
                  value={form.questionText}
                  onChange={(e) => set("questionText", e.target.value)}
                  className="min-h-24"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="shortName">Short name</Label>
                <Textarea
                  id="shortName"
                  value={form.shortName}
                  onChange={(e) => set("shortName", e.target.value)}
                  placeholder="Schools covered"
                  className="min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  A few words for the Map view node — falls back to the key
                  question text if left blank.
                </p>
              </div>
            </div>

            <FormSectionHeading>Classification</FormSectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="indicatorLevelId">Indicator type</Label>
                <Select
                  value={form.indicatorLevelId}
                  onValueChange={setIndicatorLevel}
                >
                  <SelectTrigger id="indicatorLevelId" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {indicatorLevels.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.number_label}. {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => set("priority", v as KeyQuestionInput["priority"])}
                >
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Depends on</Label>
              <p className="text-xs text-muted-foreground">
                Other key questions this one depends on — limited to
                indicator levels at or before its own.
              </p>
              {dependsOnCandidatesByLevel.size === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No earlier-or-same-level key questions to depend on yet.
                </p>
              ) : (
                <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border border-input p-2">
                  {sortedLevelsForPicker.map((level) => {
                    const candidates = dependsOnCandidatesByLevel.get(level.id)
                    if (!candidates || candidates.length === 0) return null
                    const levelStage = stageColorsForLevel(level, indicatorLevels)
                    return (
                      <div key={level.id} className="flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground">
                          {level.number_label}. {level.label}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {candidates.map((kq) => {
                            const selected = form.dependsOnKqIds.includes(kq.id)
                            return (
                              <button
                                key={kq.id}
                                type="button"
                                onClick={() => toggleDependsOn(kq.id)}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-colors",
                                  selected
                                    ? cn(levelStage.bg, levelStage.fg, "border border-transparent")
                                    : "border border-input text-muted-foreground hover:bg-muted"
                                )}
                              >
                                {selected && <Link2 className="size-2.5" />}
                                {kq.kq_number}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <FormSectionHeading>Definition &amp; action</FormSectionHeading>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="indicatorDefinition">
                  Indicator definition
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setPreviewDefinition((v) => !v)}
                >
                  {previewDefinition ? "Edit" : "Preview"}
                </Button>
              </div>
              {previewDefinition ? (
                <div className="min-h-24 rounded-md border border-input px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none">
                  {form.indicatorDefinition ? (
                    <ReactMarkdown>{form.indicatorDefinition}</ReactMarkdown>
                  ) : (
                    <span className="text-muted-foreground">Nothing to preview yet.</span>
                  )}
                </div>
              ) : (
                <Textarea
                  id="indicatorDefinition"
                  value={form.indicatorDefinition}
                  onChange={(e) => set("indicatorDefinition", e.target.value)}
                  placeholder="Markdown supported — lists, bold, links…"
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actionText">Action</Label>
              <Textarea
                id="actionText"
                value={form.actionText}
                onChange={(e) => set("actionText", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="primaryUser">Primary user</Label>
                <Input
                  id="primaryUser"
                  value={form.primaryUser}
                  onChange={(e) => set("primaryUser", e.target.value)}
                  placeholder="Program Leadership"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataAvailabilityStatus">Data availability</Label>
                <Select
                  value={form.dataAvailabilityStatus}
                  onValueChange={(v) => {
                    set(
                      "dataAvailabilityStatus",
                      v as KeyQuestionInput["dataAvailabilityStatus"]
                    )
                    if (v === "fully_available") set("dataAvailabilityNote", "")
                  }}
                >
                  <SelectTrigger id="dataAvailabilityStatus" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_AVAILABILITY_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {needsAvailabilityNote && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataAvailabilityNote">
                  Data availability note
                </Label>
                <Textarea
                  id="dataAvailabilityNote"
                  value={form.dataAvailabilityNote}
                  onChange={(e) => set("dataAvailabilityNote", e.target.value)}
                  placeholder="What's missing or delayed, and by how much?"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reasonForPriority">Reason for priority</Label>
              <Textarea
                id="reasonForPriority"
                value={form.reasonForPriority}
                onChange={(e) => set("reasonForPriority", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 px-6"
              disabled={saving || !form.areaOfEnquiryId}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
