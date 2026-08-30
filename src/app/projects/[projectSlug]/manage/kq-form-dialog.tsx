"use client"

import * as React from "react"

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
import { INDICATOR_LEVELS, PRIORITIES, type AreaOfEnquiry, type KeyQuestion } from "@/lib/types"
import type { KeyQuestionInput } from "./actions"

const emptyForm: KeyQuestionInput = {
  areaOfEnquiryId: "",
  kqNumber: "",
  questionText: "",
  indicatorType: "reach",
  indicatorDefinition: "",
  actionText: "",
  primaryUser: "",
  dataAvailability: "",
  priority: "medium",
  reasonForPriority: "",
}

function toForm(kq: KeyQuestion): KeyQuestionInput {
  return {
    areaOfEnquiryId: kq.area_of_enquiry_id,
    kqNumber: kq.kq_number,
    questionText: kq.question_text,
    indicatorType: kq.indicator_type,
    indicatorDefinition: kq.indicator_definition,
    actionText: kq.action_text,
    primaryUser: kq.primary_user,
    dataAvailability: kq.data_availability,
    priority: kq.priority,
    reasonForPriority: kq.reason_for_priority,
  }
}

export function KqFormDialog({
  areas,
  keyQuestion,
  defaultAreaId,
  trigger,
  onSubmit,
}: {
  areas: AreaOfEnquiry[]
  keyQuestion?: KeyQuestion
  defaultAreaId?: string
  trigger: React.ReactNode
  onSubmit: (input: KeyQuestionInput) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<KeyQuestionInput>(
    keyQuestion ? toForm(keyQuestion) : { ...emptyForm, areaOfEnquiryId: defaultAreaId ?? "" }
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
                <Label htmlFor="indicatorType">Indicator type</Label>
                <Select
                  value={form.indicatorType}
                  onValueChange={(v) => set("indicatorType", v as KeyQuestionInput["indicatorType"])}
                >
                  <SelectTrigger id="indicatorType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDICATOR_LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
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
              <Label htmlFor="indicatorDefinition">Indicator definition</Label>
              <Textarea
                id="indicatorDefinition"
                value={form.indicatorDefinition}
                onChange={(e) => set("indicatorDefinition", e.target.value)}
              />
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
                <Label htmlFor="dataAvailability">Data availability</Label>
                <Input
                  id="dataAvailability"
                  value={form.dataAvailability}
                  onChange={(e) => set("dataAvailability", e.target.value)}
                  placeholder="Available"
                />
              </div>
            </div>

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
