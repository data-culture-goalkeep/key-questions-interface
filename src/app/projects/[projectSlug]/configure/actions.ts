"use server"

import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/slug"
import type { PrioritizationMethodology, ProjectMode } from "@/lib/types"

async function requireFacilitatorClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email?.toLowerCase().endsWith("@goalkeep.net")) {
    throw new Error("Only facilitators can make changes here.")
  }
  return supabase
}

export async function updateProjectDetails(
  projectId: string,
  input: {
    name: string
    clientName: string
    prioritizationMethodology: PrioritizationMethodology
  }
) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("projects")
    .update({
      name: input.name,
      client_name: input.clientName,
      prioritization_methodology: input.prioritizationMethodology,
    })
    .eq("id", projectId)
  if (error) throw error
}

export async function setProjectMode(projectId: string, mode: ProjectMode) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("projects")
    .update({ mode })
    .eq("id", projectId)
  if (error) throw error
}

export async function setProjectLogo(projectId: string, logoUrl: string | null) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("projects")
    .update({ logo_url: logoUrl })
    .eq("id", projectId)
  if (error) throw error
}

// --- Indicator levels -----------------------------------------------------

export async function createIndicatorLevel(
  projectId: string,
  input: { label: string; numberLabel: string }
) {
  const supabase = await requireFacilitatorClient()
  const { data: existingLevels } = await supabase
    .from("indicator_levels")
    .select("key, sequence")
    .eq("project_id", projectId)

  const base = slugify(input.label) || "level"
  const existingKeys = new Set((existingLevels ?? []).map((l) => l.key))
  let key = base
  let suffix = 2
  while (existingKeys.has(key)) {
    key = `${base}-${suffix}`
    suffix += 1
  }

  // Append after the highest existing sequence rather than using the row
  // count — the two only coincide if sequences are a gapless 0-indexed
  // run, which isn't guaranteed (e.g. this project's levels were seeded
  // starting at 1, not 0).
  const maxSequence = (existingLevels ?? []).reduce(
    (max, l) => Math.max(max, l.sequence),
    -1
  )

  const { error } = await supabase.from("indicator_levels").insert({
    project_id: projectId,
    key,
    label: input.label,
    number_label: input.numberLabel,
    sequence: maxSequence + 1,
  })
  if (error) throw error
}

export async function updateIndicatorLevel(
  levelId: string,
  input: { label: string; numberLabel: string }
) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("indicator_levels")
    .update({ label: input.label, number_label: input.numberLabel })
    .eq("id", levelId)
  if (error) throw error
}

export async function deleteIndicatorLevel(levelId: string) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("indicator_levels")
    .delete()
    .eq("id", levelId)
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "This level still has key questions assigned to it — reassign them in Manage before removing it."
      )
    }
    throw error
  }
}

export async function moveIndicatorLevel(
  projectId: string,
  levelId: string,
  direction: "up" | "down"
) {
  const supabase = await requireFacilitatorClient()
  const { data: levels, error } = await supabase
    .from("indicator_levels")
    .select("id, sequence")
    .eq("project_id", projectId)
    .order("sequence")
  if (error) throw error

  const index = levels.findIndex((l) => l.id === levelId)
  const swapWith = direction === "up" ? index - 1 : index + 1
  if (index === -1 || swapWith < 0 || swapWith >= levels.length) return

  const a = levels[index]
  const b = levels[swapWith]
  await Promise.all([
    supabase
      .from("indicator_levels")
      .update({ sequence: b.sequence })
      .eq("id", a.id),
    supabase
      .from("indicator_levels")
      .update({ sequence: a.sequence })
      .eq("id", b.id),
  ])
}
