"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { elementMeta } from "@/lib/mockup/build-view"
import { REVIEWER_NAMES } from "@/lib/mockup/content/reviewers"
import { DASHBOARD_VIEWS, viewById } from "@/lib/mockup/content/views"
import { setCommentIncorporate, setThreadResolved } from "@/lib/mockup/actions"
import type { MockupComment, MockupData } from "@/lib/mockup/types"

import { overallFeedback, useMockup } from "../mockup-provider"
import { EditableCommentBody } from "./comment-item"
import { NextStepsPanel } from "./next-steps-panel"
import { avatarStyle, initial, relativeTime } from "./ui"

// The feedback log is comment-only. Two modes: chart-level comment threads,
// and page/overall feedback. The verdict grid lives in the response matrix.

type Mode = "chart" | "page"
const ALL_VIEWS = "All views"

interface LogElement {
  viewId: string
  num: string
  comments: MockupComment[]
  resolved: boolean
}

export function LogBody() {
  const router = useRouter()
  const mk = useMockup()
  const { data, mutate, setFocus } = mk
  const [mode, setMode] = React.useState<Mode>("chart")
  const [reviewer, setReviewer] = React.useState("All reviewers")
  const [viewFilter, setViewFilter] = React.useState(ALL_VIEWS)
  const [showResolved, setShowResolved] = React.useState(false)

  if (!data) return null

  const groups = buildLogGroups(data, { reviewer, viewFilter, showResolved })
  const elementCount = groups.reduce((a, g) => a + g.items.length, 0)

  function toggleResolved(el: LogElement) {
    const next = !el.resolved
    const resolvedAt = next ? new Date().toISOString() : null
    mutate(
      (d) => ({
        ...d,
        comments: d.comments.map((c) =>
          c.scope === "element" &&
          c.viewId === el.viewId &&
          c.elementNum === el.num &&
          !c.parentId
            ? { ...c, resolvedAt }
            : c,
        ),
      }),
      () =>
        setThreadResolved({
          viewId: el.viewId,
          elementNum: el.num,
          resolved: next,
        }),
    )
  }

  function open(el: LogElement) {
    setFocus(el.num)
    router.push(`/mockups/sandipani/v/${el.viewId}`)
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          padding: "10px 13px",
          background: "var(--mk-surface)",
          border: "1px solid var(--mk-border)",
          borderRadius: 10,
          marginBottom: 13,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            border: "1px solid var(--mk-border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {(["chart", "page"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              style={{
                padding: "5px 12px",
                border: 0,
                background: mode === m ? "var(--mk-blue)" : "#fff",
                color: mode === m ? "#fff" : "var(--mk-sec)",
                fontSize: 12,
                fontWeight: mode === m ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {m === "chart" ? "Chart comments" : "Page & overall feedback"}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: "var(--mk-border)" }} />

        <FilterSelect
          label="Reviewer"
          value={reviewer}
          onChange={setReviewer}
          options={["All reviewers", ...[...REVIEWER_NAMES].sort()]}
        />
        <FilterSelect
          label="View"
          value={viewFilter}
          onChange={setViewFilter}
          options={[ALL_VIEWS, ...DASHBOARD_VIEWS.map((v) => v.label)]}
        />
        {mode === "chart" && (
          <Toggle
            label="Include resolved"
            on={showResolved}
            onClick={() => setShowResolved((v) => !v)}
          />
        )}
        <div style={{ flex: 1 }} />
        {mode === "chart" && (
          <span style={{ fontSize: 12, color: "var(--mk-sec)" }}>
            {elementCount === 1
              ? "1 element with feedback"
              : `${elementCount} elements with feedback`}
          </span>
        )}
      </div>

      {mode === "chart" ? (
        groups.length === 0 ? (
          <EmptyState />
        ) : (
          groups.map((g) => (
            <div key={g.viewId} style={{ marginBottom: 16 }}>
              <GroupHeader
                title={viewById(g.viewId)?.title ?? g.viewId}
                count={`${g.items.length} element${g.items.length === 1 ? "" : "s"}`}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {g.items.map((el) => {
                  const meta = elementMeta(el.viewId, el.num)
                  return (
                    <div
                      key={el.num}
                      style={{
                        background: "var(--mk-surface)",
                        border: "1px solid var(--mk-border)",
                        borderRadius: 11,
                        padding: "13px 15px",
                        opacity: el.resolved ? 0.6 : 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 9,
                        }}
                      >
                        <span
                          className="mk-mono"
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "var(--mk-blue)",
                          }}
                        >
                          {el.num}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                          {meta.name}
                        </span>
                        <div style={{ flex: 1 }} />
                        <button
                          type="button"
                          onClick={() => toggleResolved(el)}
                          style={{
                            padding: "3px 9px",
                            border: `1px solid ${el.resolved ? "var(--mk-good-fg)" : "var(--mk-border)"}`,
                            borderRadius: 12,
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: el.resolved
                              ? "var(--mk-good-fg)"
                              : "var(--mk-sec)",
                            background: el.resolved
                              ? "var(--mk-good-bg)"
                              : "#fff",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {el.resolved ? "Resolved" : "Mark resolved"}
                        </button>
                        <button
                          type="button"
                          onClick={() => open(el)}
                          style={{
                            border: 0,
                            background: "transparent",
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "var(--mk-blue)",
                            cursor: "pointer",
                          }}
                        >
                          Open →
                        </button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 7,
                        }}
                      >
                        {el.comments.map((cm) => (
                          <CommentCard key={cm.id} comment={cm} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )
      ) : (
        <PageFeedbackLog data={data} reviewer={reviewer} viewFilter={viewFilter} />
      )}

      <NextStepsPanel />
    </>
  )
}

// ---------------------------------------------------------------------------

function PageFeedbackLog({
  data,
  reviewer,
  viewFilter,
}: {
  data: MockupData
  reviewer: string
  viewFilter: string
}) {
  const match = (c: MockupComment) =>
    reviewer === "All reviewers" || c.reviewerName === reviewer

  const byView = new Map<string, MockupComment[]>()
  for (const c of data.comments) {
    if (c.scope !== "page" || !c.viewId || !match(c)) continue
    const label = viewById(c.viewId)?.label ?? c.viewId
    if (viewFilter !== ALL_VIEWS && label !== viewFilter) continue
    ;(byView.get(c.viewId) ?? byView.set(c.viewId, []).get(c.viewId)!).push(c)
  }
  const overall =
    viewFilter === ALL_VIEWS ? overallFeedback(data).filter(match) : []

  if (byView.size === 0 && overall.length === 0) return <EmptyState />

  return (
    <>
      {[...byView.keys()].sort().map((viewId) => {
        const items = byView
          .get(viewId)!
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        return (
          <div key={viewId} style={{ marginBottom: 16 }}>
            <GroupHeader
              title={viewById(viewId)?.title ?? viewId}
              count={`${items.length} note${items.length === 1 ? "" : "s"}`}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((c) => (
                <CommentCard key={c.id} comment={c} showConfidence />
              ))}
            </div>
          </div>
        )
      })}
      {overall.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <GroupHeader
            title="Whole dashboard"
            count={`${overall.length} note${overall.length === 1 ? "" : "s"}`}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overall.map((c) => (
              <CommentCard key={c.id} comment={c} showConfidence />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function CommentCard({
  comment,
  showConfidence,
}: {
  comment: MockupComment
  showConfidence?: boolean
}) {
  const { mutate } = useMockup()
  const [pending, setPending] = React.useState(false)

  function toggleIncorporate() {
    const value = !comment.toIncorporate
    setPending(true)
    mutate(
      (d) => ({
        ...d,
        comments: d.comments.map((c) =>
          c.id === comment.id ? { ...c, toIncorporate: value } : c,
        ),
      }),
      () => setCommentIncorporate({ commentId: comment.id, value }),
    ).finally(() => setPending(false))
  }

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 9,
        background: comment.toIncorporate
          ? "var(--mk-blue-tint)"
          : "var(--mk-canvas)",
        border: comment.toIncorporate
          ? "1px solid var(--mk-blue)"
          : "1px solid transparent",
        marginLeft: comment.parentId ? 16 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 5,
        }}
      >
        <span style={avatarStyle(comment.reviewerName, 20)}>
          {initial(comment.reviewerName)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {comment.reviewerName}
        </span>
        <span style={{ fontSize: 10.5, color: "var(--mk-muted)" }}>
          {relativeTime(comment.createdAt)}
        </span>
        {comment.isExample && (
          <span
            className="mk-mono"
            style={{
              fontSize: 9,
              letterSpacing: ".05em",
              textTransform: "uppercase",
              padding: "2px 5px",
              borderRadius: 3,
              background: "var(--mk-border-soft)",
              color: "var(--mk-sec)",
              fontWeight: 600,
            }}
          >
            Example
          </span>
        )}
        <div style={{ flex: 1 }} />
        {showConfidence && comment.confidence && (
          <span
            className="mk-mono"
            style={{ fontSize: 10, fontWeight: 600, color: "var(--mk-blue)" }}
          >
            confidence {comment.confidence}/5
          </span>
        )}
        <button
          type="button"
          onClick={toggleIncorporate}
          disabled={pending}
          title="Collate this into the Next Steps summary"
          style={{
            padding: "3px 9px",
            borderRadius: 12,
            border: `1px solid ${comment.toIncorporate ? "var(--mk-blue)" : "var(--mk-border)"}`,
            background: comment.toIncorporate ? "var(--mk-blue)" : "#fff",
            color: comment.toIncorporate ? "#fff" : "var(--mk-sec)",
            fontSize: 10.5,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {comment.toIncorporate ? "✓ To incorporate" : "To incorporate"}
        </button>
      </div>
      <EditableCommentBody comment={comment} fontSize={12.5} />
    </div>
  )
}

function GroupHeader({ title, count }: { title: string; count: string }) {
  return (
    <div
      style={{
        marginBottom: 10,
        paddingBottom: 7,
        borderBottom: "1px solid var(--mk-border)",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--mk-ink)" }}>
        {title}
      </h2>
      <span style={{ fontSize: 11.5, color: "var(--mk-sec)" }}>{count}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        background: "var(--mk-surface)",
        border: "1px dashed #d8d6d6",
        borderRadius: 11,
        padding: "44px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
        No feedback matches this filter
      </div>
      <div style={{ fontSize: 12.5, color: "var(--mk-sec)" }}>
        Leave a comment on a chart, or page-level feedback at the bottom of a view.
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 9px",
        border: "1px solid var(--mk-border)",
        borderRadius: 7,
        fontSize: 12,
      }}
    >
      <span style={{ color: "var(--mk-sec)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: 0,
          background: "transparent",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          outline: "none",
          maxWidth: 170,
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "5px 10px",
        border: `1px solid ${on ? "var(--mk-blue)" : "var(--mk-border)"}`,
        borderRadius: 7,
        background: on ? "var(--mk-blue-tint)" : "#fff",
        color: on ? "var(--mk-blue)" : "var(--mk-sec)",
        fontSize: 12,
        fontWeight: on ? 600 : 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------

interface LogGroup {
  viewId: string
  items: LogElement[]
}

function buildLogGroups(
  data: MockupData,
  opts: { reviewer: string; viewFilter: string; showResolved: boolean },
): LogGroup[] {
  const byKey = new Map<string, MockupComment[]>()
  for (const c of data.comments) {
    if (c.scope !== "element" || !c.viewId || !c.elementNum) continue
    const key = `${c.viewId}:${c.elementNum}`
    ;(byKey.get(key) ?? byKey.set(key, []).get(key)!).push(c)
  }

  const byView = new Map<string, LogElement[]>()
  for (const [key, all] of byKey) {
    const [viewId, num] = key.split(":")
    if (
      opts.viewFilter !== ALL_VIEWS &&
      (viewById(viewId)?.label ?? viewId) !== opts.viewFilter
    )
      continue

    let comments = [...all].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    )
    if (opts.reviewer !== "All reviewers")
      comments = comments.filter((c) => c.reviewerName === opts.reviewer)
    if (!comments.length) continue

    const resolved = all.some((c) => !c.parentId && !!c.resolvedAt)
    if (!opts.showResolved && resolved) continue

    const list = byView.get(viewId) ?? byView.set(viewId, []).get(viewId)!
    list.push({ viewId, num, comments, resolved })
  }

  return [...byView.keys()].sort().map((viewId) => ({
    viewId,
    items: byView
      .get(viewId)!
      .sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true })),
  }))
}

// ---------------------------------------------------------------------------
// TODO(#31): the "Copy for the feedback sheet" button was removed; this TSV
// builder is kept only until the follow-up issue lands. It is exported (not
// called anywhere) so it doesn't trip no-unused-vars.
// ---------------------------------------------------------------------------

const TSV_HEADER = [
  "View",
  "Element #",
  "Element",
  "Type",
  "Related KQs",
  "Good to go?",
  "What works",
  "What needs to change",
  "What's missing",
  "Decision",
]

export function buildTsv(data: MockupData): string {
  const rows: string[][] = [TSV_HEADER]

  const byKey = new Map<string, MockupComment[]>()
  for (const c of data.comments) {
    if (c.scope !== "element" || !c.viewId || !c.elementNum) continue
    const key = `${c.viewId}:${c.elementNum}`
    ;(byKey.get(key) ?? byKey.set(key, []).get(key)!).push(c)
  }
  for (const [key, all] of byKey) {
    const [viewId, num] = key.split(":")
    const view = viewById(viewId)
    const meta = elementMeta(viewId, num)
    const answer = data.answers.find(
      (a) => a.viewId === viewId && a.elementNum === num,
    )
    const resolved = all.some((c) => !c.parentId && !!c.resolvedAt)
    const text = all
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((c) => `${c.reviewerName}: ${c.body}`)
      .join(" | ")
    rows.push([
      view?.label ?? viewId,
      num,
      meta.name,
      meta.kind,
      meta.kq || "",
      answer?.verdict || "",
      text,
      "",
      "",
      resolved ? "Resolved" : "",
    ])
  }

  for (const c of data.comments.filter((x) => x.scope === "page")) {
    const view = viewById(c.viewId ?? "")
    rows.push([
      view?.label ?? c.viewId ?? "",
      "—",
      "Whole view",
      "Page",
      "",
      "",
      `${c.reviewerName}: ${c.body} (confidence ${c.confidence ?? 0}/5)`,
      "",
      "",
      "",
    ])
  }
  for (const c of overallFeedback(data)) {
    rows.push([
      "All views",
      "—",
      "Whole dashboard",
      "Overall",
      "",
      "",
      `${c.reviewerName}: ${c.body} (confidence ${c.confidence ?? 0}/5)`,
      "",
      "",
      "",
    ])
  }

  return rows.map((r) => r.join("\t")).join("\n")
}
