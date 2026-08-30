"use server"

import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/slug"

const DEFAULT_INDICATOR_LEVELS = [
  { key: "reach", label: "Reach", number_label: "1", sequence: 1 },
  { key: "input", label: "Input", number_label: "2", sequence: 2 },
  { key: "output", label: "Output", number_label: "3", sequence: 3 },
  {
    key: "intermediate_outcome",
    label: "Intermediate Outcome",
    number_label: "4",
    sequence: 4,
  },
  { key: "impact", label: "Impact", number_label: "5", sequence: 5 },
]

async function requireFacilitatorClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email?.toLowerCase().endsWith("@goalkeep.net")) {
    throw new Error("Only facilitators can create projects.")
  }
  return supabase
}

export async function createProject(name: string, clientName: string) {
  const supabase = await requireFacilitatorClient()

  const base = slugify(name) || "project"
  let slug = base
  let suffix = 2
  // Bounded by how many projects share a name — fine for the low,
  // facilitator-driven project-creation volume this app expects.
  while (true) {
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()
    if (!existing) break
    slug = `${base}-${suffix}`
    suffix += 1
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ name, client_name: clientName, slug })
    .select("id, slug")
    .single()
  if (error) throw error

  const { error: levelsError } = await supabase
    .from("indicator_levels")
    .insert(
      DEFAULT_INDICATOR_LEVELS.map((l) => ({ ...l, project_id: project.id }))
    )
  if (levelsError) throw levelsError

  return { slug: project.slug as string }
}
