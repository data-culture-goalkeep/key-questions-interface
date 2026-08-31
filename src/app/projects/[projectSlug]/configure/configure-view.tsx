"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import {
  PRIORITIZATION_METHODOLOGIES,
  type IndicatorLevel,
  type PrioritizationMethodology,
  type Project,
  type ProjectMode,
} from "@/lib/types"

import {
  createIndicatorLevel,
  deleteIndicatorLevel,
  moveIndicatorLevel,
  setProjectLogo,
  setProjectMode,
  updateIndicatorLevel,
  updateProjectDetails,
} from "./actions"

export function ConfigureView({
  project,
  indicatorLevels,
}: {
  project: Project
  indicatorLevels: IndicatorLevel[]
}) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  function run(fn: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try {
        await fn()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "That didn't go through.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Configure project</h2>
        <p className="text-sm text-muted-foreground">
          Project details, indicator levels, prioritization methodology, and
          the NGO logo.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ProjectModeCard project={project} run={run} />
      <ProjectDetailsCard project={project} run={run} />
      <IndicatorLevelsCard
        projectId={project.id}
        indicatorLevels={indicatorLevels}
        run={run}
      />
      <LogoCard project={project} run={run} />
    </div>
  )
}

function ProjectModeCard({
  project,
  run,
}: {
  project: Project
  run: (fn: () => Promise<void>) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project mode</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Controls which of Review or Prioritize shows in the project nav
          for everyone — it doesn&apos;t change who can do what beneath
          that. Switch to Prioritization once refinement is done; only
          locked key questions become rankable either way.
        </p>
        <div className="flex w-fit overflow-hidden rounded-md border border-input">
          {(["review", "prioritization"] as ProjectMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={project.mode === mode}
              onClick={() => run(() => setProjectMode(project.id, mode))}
              className={
                project.mode === mode
                  ? "bg-foreground px-3 py-1.5 text-sm text-background"
                  : "px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              }
            >
              {mode === "review" ? "Review" : "Prioritization"}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectDetailsCard({
  project,
  run,
}: {
  project: Project
  run: (fn: () => Promise<void>) => void
}) {
  const [name, setName] = React.useState(project.name)
  const [clientName, setClientName] = React.useState(project.client_name)
  const [methodology, setMethodology] =
    React.useState<PrioritizationMethodology>(
      project.prioritization_methodology
    )

  function save() {
    run(() =>
      updateProjectDetails(project.id, {
        name: name.trim(),
        clientName: clientName.trim(),
        prioritizationMethodology: methodology,
      })
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clientName">Client name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="methodology">Prioritization methodology</Label>
          <Select
            value={methodology}
            onValueChange={(v) => setMethodology(v as PrioritizationMethodology)}
          >
            <SelectTrigger id="methodology" className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIZATION_METHODOLOGIES.map((m) => (
                <SelectItem key={m.value} value={m.value} disabled={!m.available}>
                  {m.label}
                  {!m.available && " (coming soon)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          disabled={!name.trim() || !clientName.trim()}
          onClick={save}
        >
          Save details
        </Button>
      </CardContent>
    </Card>
  )
}

function IndicatorLevelsCard({
  projectId,
  indicatorLevels,
  run,
}: {
  projectId: string
  indicatorLevels: IndicatorLevel[]
  run: (fn: () => Promise<void>) => void
}) {
  const sorted = [...indicatorLevels].sort((a, b) => a.sequence - b.sequence)
  const [newLabel, setNewLabel] = React.useState("")
  const [newNumberLabel, setNewNumberLabel] = React.useState("")

  function addLevel() {
    if (!newLabel.trim() || !newNumberLabel.trim()) return
    run(() =>
      createIndicatorLevel(projectId, {
        label: newLabel.trim(),
        numberLabel: newNumberLabel.trim(),
      })
    )
    setNewLabel("")
    setNewNumberLabel("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicator levels</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Drop a level this project doesn&apos;t use (e.g. Reach), or split
          Outcomes into two by editing one row to &quot;4A&quot; and adding a
          new &quot;4B&quot; row.
        </p>

        {sorted.map((level, index) => (
          <IndicatorLevelRow
            key={level.id}
            projectId={projectId}
            level={level}
            isFirst={index === 0}
            isLast={index === sorted.length - 1}
            run={run}
          />
        ))}

        <Separator />

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newNumberLabel">Number</Label>
            <Input
              id="newNumberLabel"
              className="w-20"
              placeholder="4B"
              value={newNumberLabel}
              onChange={(e) => setNewNumberLabel(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newLabel">Label</Label>
            <Input
              id="newLabel"
              placeholder="Intermediate Outcome"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={!newLabel.trim() || !newNumberLabel.trim()}
            onClick={addLevel}
          >
            <Plus className="size-3.5" />
            Add level
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function IndicatorLevelRow({
  projectId,
  level,
  isFirst,
  isLast,
  run,
}: {
  projectId: string
  level: IndicatorLevel
  isFirst: boolean
  isLast: boolean
  run: (fn: () => Promise<void>) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [label, setLabel] = React.useState(level.label)
  const [numberLabel, setNumberLabel] = React.useState(level.number_label)

  function save() {
    run(() =>
      updateIndicatorLevel(level.id, {
        label: label.trim(),
        numberLabel: numberLabel.trim(),
      })
    )
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2.5">
      {editing ? (
        <>
          <Input
            className="w-16"
            value={numberLabel}
            onChange={(e) => setNumberLabel(e.target.value)}
          />
          <Input
            className="flex-1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
          />
          <Button type="button" size="sm" onClick={save}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setLabel(level.label)
              setNumberLabel(level.number_label)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">
            {level.number_label}. {level.label}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            onClick={() => run(() => moveIndicatorLevel(projectId, level.id, "up"))}
            aria-label="Move up"
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            onClick={() => run(() => moveIndicatorLevel(projectId, level.id, "down"))}
            aria-label="Move down"
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditing(true)}
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Delete">
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Remove &quot;{level.label}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Fails if any key question still uses this level — reassign
                  them in Manage first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => run(() => deleteIndicatorLevel(level.id))}
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

function LogoCard({
  project,
  run,
}: {
  project: Project
  run: (fn: () => Promise<void>) => void
}) {
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const path = `${project.id}/logo-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("project-assets")
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("project-assets").getPublicUrl(path)

      run(() => setProjectLogo(project.id, publicUrl))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NGO logo</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {project.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage-hosted image, not worth Next/Image config for a small preview
          <img
            src={project.logo_url}
            alt=""
            className="size-16 rounded border border-border object-contain"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded border border-dashed border-border text-xs text-muted-foreground">
            No logo
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          {uploading && (
            <p className="text-xs text-muted-foreground">Uploading…</p>
          )}
          {project.logo_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => run(() => setProjectLogo(project.id, null))}
            >
              Remove logo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
