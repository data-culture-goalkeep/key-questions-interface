import "server-only"

import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Project } from "@/lib/types"

export async function getProjectBySlug(slug: string): Promise<Project> {
  const supabase = await createClient()
  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, slug, name, client_name, status, logo_url, prioritization_methodology, mode"
    )
    .eq("slug", slug)
    .single()

  if (!project) notFound()
  return project as Project
}
