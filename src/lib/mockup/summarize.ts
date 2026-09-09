"use server"

import Anthropic from "@anthropic-ai/sdk"

import { elementMeta } from "./build-view"
import { viewById } from "./content/views"
import { createAdminClient } from "./supabase/admin"
import type { AnswerValue, MockupSummary } from "./types"

const MODEL = "claude-sonnet-5"

const SYSTEM = `You are helping a programme team turn dashboard-mockup review feedback into a concrete change list.

You will be given a list of feedback items. Each item has: the dashboard view, the chart it is about (or "whole view" / "whole dashboard"), how reviewers voted on whether that chart is "good to go" (yes / partly / no counts), and one reviewer comment.

Produce a single GitHub-flavored Markdown table of next steps with these columns:
| # | Area | Change to make | Why | Source feedback |

- One row per distinct change. Merge feedback items that call for the same change; cite each contributing chart/view in "Source feedback" (e.g. "v4 · 4.29; v3 · 3.5").
- "Change to make" must be an actionable instruction, not a restatement of the complaint.
- Order rows roughly by impact: blocking issues first, polish last.
- Keep "Why" to one short sentence.
- Output ONLY the table — no preamble, no closing notes.`

interface FeedbackItem {
  view: string
  chart: string
  votes: string
  author: string
  comment: string
}

export async function summarizeNextSteps(): Promise<MockupSummary> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set")

  const supabase = createAdminClient()

  const [{ data: commentRows, error: cErr }, { data: answerRows, error: aErr }] =
    await Promise.all([
      supabase
        .from("sandipani_comments")
        .select(
          "reviewer_id, scope, view_id, element_num, body, created_at",
        )
        .eq("to_incorporate", true)
        .order("created_at"),
      supabase
        .from("sandipani_element_answers")
        .select("view_id, element_num, verdict"),
    ])
  if (cErr) throw cErr
  if (aErr) throw aErr

  const { data: reviewers } = await supabase
    .from("sandipani_reviewers")
    .select("id, name")
  const nameById = new Map(
    (reviewers ?? []).map((r) => [r.id as string, r.name as string]),
  )

  // Aggregate verdicts per element.
  const votesByEl = new Map<string, Record<AnswerValue, number>>()
  for (const a of (answerRows ?? []) as {
    view_id: string
    element_num: string
    verdict: AnswerValue | null
  }[]) {
    if (!a.verdict) continue
    const key = `${a.view_id}:${a.element_num}`
    const rec =
      votesByEl.get(key) ?? ({ yes: 0, partly: 0, no: 0 } as Record<AnswerValue, number>)
    rec[a.verdict]++
    votesByEl.set(key, rec)
  }

  const rows = (commentRows ?? []) as {
    reviewer_id: string
    scope: string
    view_id: string | null
    element_num: string | null
    body: string
  }[]

  if (rows.length === 0) {
    throw new Error(
      'No comments are marked "To be incorporated" yet — flag some first.',
    )
  }

  const items: FeedbackItem[] = rows.map((c) => {
    const view = c.view_id
      ? (viewById(c.view_id)?.label ?? c.view_id)
      : "All views"
    let chart = "Whole dashboard"
    let votes = "—"
    if (c.scope === "element" && c.view_id && c.element_num) {
      const meta = elementMeta(c.view_id, c.element_num)
      chart = `${c.element_num} ${meta.name} (${meta.kind})`
      const v = votesByEl.get(`${c.view_id}:${c.element_num}`)
      votes = v
        ? `${v.yes} yes / ${v.partly} partly / ${v.no} no`
        : "no votes yet"
    } else if (c.scope === "page") {
      chart = "Whole view"
    }
    return {
      view,
      chart,
      votes,
      author: nameById.get(c.reviewer_id) ?? "Reviewer",
      comment: c.body,
    }
  })

  const userContent =
    "Feedback items:\n\n" +
    items
      .map(
        (it, i) =>
          `${i + 1}. View: ${it.view}\n   Chart: ${it.chart}\n   Votes: ${it.votes}\n   ${it.author}: ${it.comment}`,
      )
      .join("\n\n")

  // Org-level (non-workspace-scoped) keys need an explicit workspace id.
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID
  const client = new Anthropic({
    apiKey,
    ...(workspaceId
      ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } }
      : {}),
  })

  let response
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: SYSTEM,
      messages: [{ role: "user", content: userContent }],
    })
  } catch (e) {
    if (
      e instanceof Anthropic.APIError &&
      /workspace/i.test(e.message) &&
      !workspaceId
    ) {
      throw new Error(
        "The Anthropic API key isn't scoped to a workspace — set ANTHROPIC_WORKSPACE_ID, or use a workspace-scoped key.",
      )
    }
    throw e
  }

  const content = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()

  if (!content) throw new Error("Claude returned an empty summary")

  const { data: saved, error: sErr } = await supabase
    .from("sandipani_summaries")
    .insert({ content, comment_count: items.length })
    .select("id, content, comment_count, created_at")
    .single()
  if (sErr) throw sErr

  return {
    id: saved.id,
    content: saved.content,
    commentCount: saved.comment_count,
    createdAt: saved.created_at,
  }
}
