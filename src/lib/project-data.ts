"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  AreaOfEnquiry,
  IndicatorLevel,
  KeyQuestion,
  KeyQuestionLink,
  Project,
  VoteRow,
} from "@/lib/types"

const FACILITATOR_DOMAIN = "@goalkeep.net"

export interface ProjectData {
  project: Project
  role: "facilitator" | "client"
  userId: string
  userEmail: string
  avatarUrl: string | null
  fullName: string | null
  // Unix seconds the current session expires at, or null if unavailable.
  expiresAt: number | null
  areas: AreaOfEnquiry[]
  keyQuestions: KeyQuestion[]
  indicatorLevels: IndicatorLevel[]
  links: KeyQuestionLink[]
  votes: VoteRow[]
}

// Everything a project's view tree needs — identity, the project itself,
// and all key-question data — in one call. Fetched once on the client when
// the view tree mounts (see ProjectDataProvider) and reused across view
// switches, so layout.tsx and every page.tsx stay entirely free of
// server-side Supabase calls. Returns null when the slug doesn't resolve to
// a project or the caller isn't signed in (middleware normally prevents
// the latter) — callers show a "not found" state rather than a real 404,
// an acceptable trade-off for an internal, authenticated tool.
export async function getProjectData(
  projectSlug: string
): Promise<ProjectData | null> {
  const supabase = await createClient()

  const [
    {
      data: { user },
    },
    { data: project },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("projects")
      .select(
        "id, slug, name, client_name, status, logo_url, prioritization_methodology, mode"
      )
      .eq("slug", projectSlug)
      .single(),
  ])

  if (!user || !user.email || !project) return null

  const role = user.email.toLowerCase().endsWith(FACILITATOR_DOMAIN)
    ? "facilitator"
    : "client"

  // getSession() reads the session straight from cookies (no network
  // round-trip) — only used here for its expires_at timestamp, not as the
  // source of truth for identity, which stays getUser() above.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const [{ data: areas }, { data: keyQuestions }, { data: indicatorLevels }] =
    await Promise.all([
      supabase
        .from("areas_of_enquiry")
        .select("id, project_id, name, area_number, sequence")
        .eq("project_id", project.id)
        .order("sequence"),
      supabase
        .from("key_questions")
        .select(
          "id, project_id, area_of_enquiry_id, kq_number, question_text, short_name, indicator_level_id, indicator_definition, action_text, primary_user, data_availability_status, data_availability_note, priority, reason_for_priority, sequence, is_locked, key_question_comments(id, key_question_id, author_id, author_email, comment_text, comment_type, status, created_at), key_question_client_reviews(id, key_question_id, user_id, user_email, verified_at)"
        )
        .eq("project_id", project.id)
        .order("sequence"),
      supabase
        .from("indicator_levels")
        .select("id, project_id, key, label, number_label, sequence")
        .eq("project_id", project.id)
        .order("sequence"),
    ])

  const kqIds = (keyQuestions ?? []).map((k) => k.id)

  const [{ data: links }, { data: votes }] =
    kqIds.length > 0
      ? await Promise.all([
          supabase
            .from("key_question_links")
            .select(
              "id, key_question_id_a, key_question_id_b, relationship_type"
            )
            .or(
              `key_question_id_a.in.(${kqIds.join(",")}),key_question_id_b.in.(${kqIds.join(",")})`
            ),
          supabase
            .from("key_question_priority_votes")
            .select("key_question_id, voter_id, rank_within_type")
            .in("key_question_id", kqIds),
        ])
      : [{ data: [] }, { data: [] }]

  return {
    project: project as Project,
    role,
    userId: user.id,
    userEmail: user.email,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
    expiresAt: session?.expires_at ?? null,
    areas: (areas ?? []) as AreaOfEnquiry[],
    keyQuestions: (keyQuestions ?? []) as unknown as KeyQuestion[],
    indicatorLevels: (indicatorLevels ?? []) as IndicatorLevel[],
    links: (links ?? []) as KeyQuestionLink[],
    votes: (votes ?? []) as VoteRow[],
  }
}
