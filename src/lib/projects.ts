import "server-only"

import { cache } from "react"
import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Project } from "@/lib/types"

// Layout and page both need this; cache() dedupes repeat calls with the
// same slug within one request instead of re-querying Supabase.
export const getProjectBySlug = cache(async (slug: string): Promise<Project> => {
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
})
