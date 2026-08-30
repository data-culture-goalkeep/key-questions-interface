"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"

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
import {
  DATA_AVAILABILITY_STATUSES,
  PRIORITIES,
  type AreaOfEnquiry,
  type IndicatorLevel,
  type KeyQuestion,
} from "@/lib/types"
import type { KeyQuestionInput } from "./actions"

function emptyForm(defaultIndicatorLevelId: string): KeyQuestionInput {
  return {
    areaOfEnquiryId: "",
    kqNumber: "",
    questionText: "",
    indicatorLevelId: defaultIndicatorLevelId,
    indicatorDefinition: "",
    actionText: "",
    primaryUser: "",
    dataAvailabilityStatus: "fully_available",
    dataAvailabilityNote: "",
    priority: "medium",
    reasonForPriority: "",
  }
}

function toForm(kq: KeyQuestion): KeyQuestionInput {
  return {
    areaOfEnquiryId: kq.area_of_enquiry_id,
    kqNumber: kq.kq_number,
    questionText: kq.question_text,
    indicatorLevelId: kq.indicator_level_id,
    indicatorDefinition: kq.indicator_definition,
    actionText: kq.action_text,
    primaryUser: kq.primary_user,
    dataAvailabilityStatus: kq.data_availability_status,
    dataAvailabilityNote: kq.data_availability_note,
    priority: kq.priority,
    reasonForPriority: kq.reason_for_priority,
  }
}

export function KqFormDialog({
  areas,
  indicatorLevels,
  keyQuestion,
  defaultAreaId,
  trigger,
  onSubmit,
}: {
  areas: AreaOfEnquiry[]
  indicatorLevels: IndicatorLevel[]
  keyQuestion?: KeyQuestion
  defaultAreaId?: string
  trigger: React.ReactNode
  onSubmit: (input: KeyQuestionInput) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<KeyQuestionInput>(
    keyQuestion
      ? toForm(keyQuestion)
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

  const [previewDefinition, setPreviewDefinition] = React.useState(false)
  const needsAvailabilityNote = form.dataAvailabilityStatus !== "fully_available"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="questionText">Key question</Label>
              <Textarea
                id="questionText"
                required
                value={form.questionText}
                onChange={(e) => set("questionText", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="indicatorLevelId">Indicator type</Label>
                <Select
                  value={form.indicatorLevelId}
                  onValueChange={(v) => set("indicatorLevelId", v)}
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.areaOfEnquiryId}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
