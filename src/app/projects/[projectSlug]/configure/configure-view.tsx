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
import { PageSkeleton } from "@/components/page-skeleton"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
  PRIORITIZATION_METHODOLOGIES,
  type IndicatorLevel,
  type PrioritizationMethodology,
  type Project,
  type ProjectMode,
} from "@/lib/types"

import { ProjectDataGate, useProjectData } from "../project-data-provider"
import {
  createIndicatorLevel,
  deleteIndicatorLevel,
  reorderIndicatorLevels,
  setProjectLogo,
  setProjectMode,
  updateIndicatorLevel,
  updateProjectDetails,
} from "./actions"

export function ConfigureView() {
  return (
    <ProjectDataGate skeletonRows={4}>
      {(data) =>
        data.role !== "facilitator" ? (
          <FacilitatorRedirect projectSlug={data.project.slug} />
        ) : (
          <ConfigureViewInner
            project={data.project}
            indicatorLevels={data.indicatorLevels}
          />
        )
      }
    </ProjectDataGate>
  )
}

// RLS is the real access boundary for facilitator-only writes — this is a
// UX nicety that bounces a client off the page rather than showing them an
// empty facilitator screen.
function FacilitatorRedirect({ projectSlug }: { projectSlug: string }) {
  const router = useRouter()
  React.useEffect(() => {
    router.replace(`/projects/${projectSlug}`)
  }, [projectSlug, router])
  return <PageSkeleton rows={4} />
}

// --- Draft model ------------------------------------------------------
//
// Nothing on this page hits Supabase until "Save changes" is clicked.
// Every control mutates this local draft; Save diffs it against the
// server-derived baseline and issues only the calls that changed.

type DraftLevel =
  | { kind: "existing"; id: string; label: string; numberLabel: string; deleted: boolean }
  | { kind: "new"; tempId: string; label: string; numberLabel: string }

type DraftLogo =
  | { kind: "unchanged" }
  | { kind: "removed" }
  | { kind: "replaced"; file: File; previewUrl: string }

interface ConfigureDraft {
  mode: ProjectMode
  name: string
  clientName: string
  methodology: PrioritizationMethodology
  levels: DraftLevel[]
  logo: DraftLogo
}

function levelKey(l: DraftLevel) {
  return l.kind === "existing" ? l.id : l.tempId
}

function makeDraft(
  project: Project,
  indicatorLevels: IndicatorLevel[]
): ConfigureDraft {
  return {
    mode: project.mode,
    name: project.name,
    clientName: project.client_name,
    methodology: project.prioritization_methodology,
    levels: [...indicatorLevels]
      .sort((a, b) => a.sequence - b.sequence)
      .map((l) => ({
        kind: "existing",
        id: l.id,
        label: l.label,
        numberLabel: l.number_label,
        deleted: false,
      })),
    logo: { kind: "unchanged" },
  }
}

function ConfigureViewInner({
  project,
  indicatorLevels,
}: {
  project: Project
  indicatorLevels: IndicatorLevel[]
}) {
  const { refresh } = useProjectData()
  const [saving, setSaving] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Derived fresh from server data on every render, same self-healing
  // pattern as prioritize-view.tsx's computedOrder — local edits only
  // exist in draftOverride, which updateDraft() seeds from this the first
  // time it's touched.
  const computedDraft = React.useMemo(
    () => makeDraft(project, indicatorLevels),
    [project, indicatorLevels]
  )
  const [draftOverride, setDraftOverride] = React.useState<ConfigureDraft | null>(
    null
  )
  const draft = dirty && draftOverride ? draftOverride : computedDraft

  function updateDraft(updater: (d: ConfigureDraft) => ConfigureDraft) {
    setDraftOverride((prev) => updater(prev ?? draft))
    setDirty(true)
  }

  const visibleLevels = draft.levels.filter(
    (l) => !(l.kind === "existing" && l.deleted)
  )
  const canSave =
    dirty &&
    !saving &&
    draft.name.trim() !== "" &&
    draft.clientName.trim() !== "" &&
    visibleLevels.every((l) => l.label.trim() !== "" && l.numberLabel.trim() !== "")

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const originalById = new Map(
        indicatorLevels.map((l) => [l.id, l])
      )

      const toDelete = draft.levels.filter(
        (l): l is Extract<DraftLevel, { kind: "existing" }> =>
          l.kind === "existing" && l.deleted
      )
      const toUpdate = draft.levels.filter(
        (l): l is Extract<DraftLevel, { kind: "existing" }> =>
          l.kind === "existing" &&
          !l.deleted &&
          (originalById.get(l.id)?.label !== l.label ||
            originalById.get(l.id)?.number_label !== l.numberLabel)
      )
      await Promise.all([
        ...toDelete.map((l) => deleteIndicatorLevel(l.id)),
        ...toUpdate.map((l) =>
          updateIndicatorLevel(l.id, {
            label: l.label,
            numberLabel: l.numberLabel,
          })
        ),
      ])

      const toCreate = draft.levels.filter(
        (l): l is Extract<DraftLevel, { kind: "new" }> => l.kind === "new"
      )
      const createdEntries = await Promise.all(
        toCreate.map(
          async (l) =>
            [
              l.tempId,
              await createIndicatorLevel(project.id, {
                label: l.label,
                numberLabel: l.numberLabel,
              }),
            ] as const
        )
      )
      const createdIds = new Map(createdEntries)

      const finalOrder = visibleLevels.map((l) =>
        l.kind === "existing" ? l.id : (createdIds.get(l.tempId) ?? l.tempId)
      )
      await reorderIndicatorLevels(finalOrder)

      if (draft.mode !== project.mode) {
        await setProjectMode(project.id, draft.mode)
      }
      if (
        draft.name !== project.name ||
        draft.clientName !== project.client_name ||
        draft.methodology !== project.prioritization_methodology
      ) {
        await updateProjectDetails(project.id, {
          name: draft.name.trim(),
          clientName: draft.clientName.trim(),
          prioritizationMethodology: draft.methodology,
        })
      }

      if (draft.logo.kind === "removed") {
        await setProjectLogo(project.id, null)
      } else if (draft.logo.kind === "replaced") {
        const supabase = createClient()
        const path = `${project.id}/logo-${Date.now()}-${draft.logo.file.name}`
        const { error: uploadError } = await supabase.storage
          .from("project-assets")
          .upload(path, draft.logo.file, { upsert: true })
        if (uploadError) throw uploadError
        const {
          data: { publicUrl },
        } = supabase.storage.from("project-assets").getPublicUrl(path)
        await setProjectLogo(project.id, publicUrl)
      }

      setDirty(false)
      setDraftOverride(null)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't save — try again.")
    } finally {
      setSaving(false)
    }
  }

  function handleDiscard() {
    setDirty(false)
    setDraftOverride(null)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Configure project</h2>
        <p className="text-sm text-muted-foreground">
          Project details, indicator levels, prioritization methodology, and
          the NGO logo — nothing here is saved until you hit Save changes.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ProjectModeCard
        mode={draft.mode}
        onChange={(mode) => updateDraft((d) => ({ ...d, mode }))}
      />
      <ProjectDetailsCard
        name={draft.name}
        clientName={draft.clientName}
        methodology={draft.methodology}
        onChange={(fields) => updateDraft((d) => ({ ...d, ...fields }))}
      />
      <IndicatorLevelsCard
        levels={draft.levels}
        onChange={(levels) => updateDraft((d) => ({ ...d, levels }))}
      />
      <LogoCard
        currentLogoUrl={project.logo_url}
        logo={draft.logo}
        onChange={(logo) => updateDraft((d) => ({ ...d, logo }))}
      />

      <div
        className={cn(
          "sticky bottom-4 flex items-center gap-3 self-start rounded-lg border border-border bg-background p-3 shadow-sm",
          !dirty && "opacity-0"
        )}
      >
        <Button type="button" disabled={!canSave} onClick={handleSave}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={!dirty || saving}
          onClick={handleDiscard}
        >
          Discard changes
        </Button>
        {dirty && !saving && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>
    </div>
  )
}

function ProjectModeCard({
  mode,
  onChange,
}: {
  mode: ProjectMode
  onChange: (mode: ProjectMode) => void
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
          {(["review", "prioritization"] as ProjectMode[]).map((m) => (
            <button
              key={m}
              type="button"
              disabled={mode === m}
              onClick={() => onChange(m)}
              className={
                mode === m
                  ? "bg-foreground px-3 py-1.5 text-sm text-background"
                  : "px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              }
            >
              {m === "review" ? "Review" : "Prioritization"}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectDetailsCard({
  name,
  clientName,
  methodology,
  onChange,
}: {
  name: string
  clientName: string
  methodology: PrioritizationMethodology
  onChange: (
    fields: Partial<Pick<ConfigureDraft, "name" | "clientName" | "methodology">>
  ) => void
}) {
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
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clientName">Client name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => onChange({ clientName: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="methodology">Prioritization methodology</Label>
          <Select
            value={methodology}
            onValueChange={(v) =>
              onChange({ methodology: v as PrioritizationMethodology })
            }
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
      </CardContent>
    </Card>
  )
}

function IndicatorLevelsCard({
  levels,
  onChange,
}: {
  levels: DraftLevel[]
  onChange: (levels: DraftLevel[]) => void
}) {
  const visible = levels.filter((l) => !(l.kind === "existing" && l.deleted))
  const [newLabel, setNewLabel] = React.useState("")
  const [newNumberLabel, setNewNumberLabel] = React.useState("")

  function addLevel() {
    if (!newLabel.trim() || !newNumberLabel.trim()) return
    onChange([
      ...levels,
      {
        kind: "new",
        tempId: crypto.randomUUID(),
        label: newLabel.trim(),
        numberLabel: newNumberLabel.trim(),
      },
    ])
    setNewLabel("")
    setNewNumberLabel("")
  }

  function moveLevel(key: string, direction: "up" | "down") {
    const visibleIndex = visible.findIndex((l) => levelKey(l) === key)
    const swapWith = direction === "up" ? visibleIndex - 1 : visibleIndex + 1
    if (visibleIndex === -1 || swapWith < 0 || swapWith >= visible.length) return
    const a = visible[visibleIndex]
    const b = visible[swapWith]
    const fullIndexA = levels.findIndex((l) => levelKey(l) === levelKey(a))
    const fullIndexB = levels.findIndex((l) => levelKey(l) === levelKey(b))
    const next = [...levels]
    ;[next[fullIndexA], next[fullIndexB]] = [next[fullIndexB], next[fullIndexA]]
    onChange(next)
  }

  function deleteLevel(key: string) {
    onChange(
      levels
        .map((l) =>
          l.kind === "existing" && levelKey(l) === key
            ? { ...l, deleted: true }
            : l
        )
        .filter((l) => !(l.kind === "new" && levelKey(l) === key))
    )
  }

  function editLevel(key: string, label: string, numberLabel: string) {
    onChange(
      levels.map((l) => (levelKey(l) === key ? { ...l, label, numberLabel } : l))
    )
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

        {visible.map((level, index) => (
          <IndicatorLevelRow
            key={levelKey(level)}
            level={level}
            isFirst={index === 0}
            isLast={index === visible.length - 1}
            onMove={(direction) => moveLevel(levelKey(level), direction)}
            onDelete={() => deleteLevel(levelKey(level))}
            onEdit={(label, numberLabel) =>
              editLevel(levelKey(level), label, numberLabel)
            }
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
  level,
  isFirst,
  isLast,
  onMove,
  onDelete,
  onEdit,
}: {
  level: DraftLevel
  isFirst: boolean
  isLast: boolean
  onMove: (direction: "up" | "down") => void
  onDelete: () => void
  onEdit: (label: string, numberLabel: string) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [label, setLabel] = React.useState(level.label)
  const [numberLabel, setNumberLabel] = React.useState(level.numberLabel)

  function save() {
    if (label.trim() && numberLabel.trim()) {
      onEdit(label.trim(), numberLabel.trim())
    }
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
              setNumberLabel(level.numberLabel)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">
            {level.numberLabel}. {level.label}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            onClick={() => onMove("up")}
            aria-label="Move up"
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            onClick={() => onMove("down")}
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
                  Removed when you save. Fails to save if any key question
                  still uses this level — reassign them in Manage first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

function LogoCard({
  currentLogoUrl,
  logo,
  onChange,
}: {
  currentLogoUrl: string | null
  logo: DraftLogo
  onChange: (logo: DraftLogo) => void
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ kind: "replaced", file, previewUrl: URL.createObjectURL(file) })
  }

  const displayUrl =
    logo.kind === "replaced"
      ? logo.previewUrl
      : logo.kind === "removed"
        ? null
        : currentLogoUrl

  return (
    <Card>
      <CardHeader>
        <CardTitle>NGO logo</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage-hosted (or local blob preview) image, not worth Next/Image config for a small preview
          <img
            src={displayUrl}
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
          {logo.kind === "replaced" && (
            <p className="text-xs text-muted-foreground">
              New logo selected — uploads when you save.
            </p>
          )}
          {displayUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => onChange({ kind: "removed" })}
            >
              Remove logo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
