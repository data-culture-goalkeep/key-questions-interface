"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { elementMeta } from "@/lib/mockup/build-view"
import { REVIEWER_NAMES } from "@/lib/mockup/content/reviewers"
import { viewById } from "@/lib/mockup/content/views"
import { setThreadResolved } from "@/lib/mockup/actions"
import {
  needsDecision as deriveNeedsDecision,
  type MockupComment,
  type MockupData,
} from "@/lib/mockup/types"

import { answerFor, overallFeedback, useMockup } from "../mockup-provider"
import { avatarStyle, initial, relativeTime } from "./ui"

interface LogElement {
  viewId: string
  num: string
  comments: MockupComment[]
  answersKq: string | null
  enablesAction: string | null
  resolved: boolean
}

export function LogBody() {
  const router = useRouter()
  const mk = useMockup()
  const { data, reviewerId, mutate, setFocus } = mk
  const [reviewer, setReviewer] = React.useState("All reviewers")
  const [needsOnly, setNeedsOnly] = React.useState(false)
  const [showResolved, setShowResolved] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  if (!data) return null

  const groups = buildLogGroups(data, reviewerId, {
    reviewer,
    needsOnly,
    showResolved,
  })
  const elementCount = groups.reduce((a, g) => a + g.items.length, 0)

  const safeData = data

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

  function copyAll() {
    const tsv = buildTsv(safeData)
    try {
      navigator.clipboard.writeText(tsv)
    } catch {
      // clipboard unavailable
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
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
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".05em",
            textTransform: "uppercase",
            color: "var(--mk-sec)",
          }}
        >
          Filter
        </span>
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
          <span style={{ color: "var(--mk-sec)" }}>Reviewer</span>
          <select
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            style={{
              border: 0,
              background: "transparent",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {["All reviewers", ...REVIEWER_NAMES].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <Toggle
          label="Needs decision only"
          on={needsOnly}
          onClick={() => setNeedsOnly((v) => !v)}
        />
        <Toggle
          label="Include resolved"
          on={showResolved}
          onClick={() => setShowResolved((v) => !v)}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--mk-sec)" }}>
          {elementCount === 1
            ? "1 element with feedback"
            : `${elementCount} elements with feedback`}
        </span>
        <button
          type="button"
          onClick={copyAll}
          style={{
            padding: "5px 11px",
            borderRadius: 7,
            border: 0,
            background: "var(--mk-ink)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {copied ? "Copied ✓" : "Copy for the feedback sheet"}
        </button>
      </div>

      {groups.length === 0 ? (
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
            Click any chart in a dashboard view to leave the first comment.
          </div>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.viewId} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 9,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: "var(--mk-sec)",
                }}
              >
                {viewById(g.viewId)?.title ?? g.viewId}
              </h2>
              <div
                style={{ flex: 1, height: 1, background: "var(--mk-border)" }}
              />
              <span style={{ fontSize: 11.5, color: "var(--mk-sec)" }}>
                {g.items.length === 1
                  ? "1 element"
                  : `${g.items.length} elements`}
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 9 }}
            >
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
                      <span
                        className="mk-mono"
                        style={{
                          fontSize: 9.5,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "var(--mk-border-soft)",
                          color: "var(--mk-sec)",
                          fontWeight: 600,
                        }}
                      >
                        {meta.kind}
                      </span>
                      {meta.kq && (
                        <span
                          className="mk-mono"
                          style={{
                            fontSize: 9.5,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "var(--mk-blue-tint)",
                            color: "var(--mk-blue)",
                            fontWeight: 600,
                          }}
                        >
                          {meta.kq}
                        </span>
                      )}
                      <div style={{ flex: 1 }} />
                      {(el.answersKq || el.enablesAction) && (
                        <span
                          style={{ fontSize: 11, color: "var(--mk-sec)" }}
                        >
                          Answers KQ:{" "}
                          <AnswerText v={el.answersKq} /> · Enables action:{" "}
                          <AnswerText v={el.enablesAction} />
                        </span>
                      )}
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
                        <div
                          key={cm.id}
                          style={{
                            padding: "10px 11px",
                            borderRadius: 9,
                            background: "var(--mk-canvas)",
                            marginLeft: cm.parentId ? 16 : 0,
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
                            <span style={avatarStyle(cm.reviewerName, 20)}>
                              {initial(cm.reviewerName)}
                            </span>
                            <span
                              style={{ fontSize: 12, fontWeight: 600 }}
                            >
                              {cm.reviewerName}
                            </span>
                            <span
                              style={{
                                fontSize: 10.5,
                                color: "var(--mk-muted)",
                              }}
                            >
                              {relativeTime(cm.createdAt)}
                            </span>
                            {cm.isExample && (
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
                          </div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                            {cm.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </>
  )
}

function AnswerText({ v }: { v: string | null }) {
  return (
    <strong
      style={{
        textTransform: "capitalize",
        color:
          v === "yes"
            ? "var(--mk-good-fg)"
            : v
              ? "var(--mk-bad-fg)"
              : "var(--mk-sec)",
      }}
    >
      {v ?? "—"}
    </strong>
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
  reviewerId: string | null,
  opts: { reviewer: string; needsOnly: boolean; showResolved: boolean },
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
    let comments = [...all].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    )
    if (opts.reviewer !== "All reviewers")
      comments = comments.filter((c) => c.reviewerName === opts.reviewer)
    if (!comments.length) continue

    const ans = answerFor(data, reviewerId, viewId, num)
    if (opts.needsOnly && !deriveNeedsDecision(ans)) continue

    const resolved = all.some((c) => !c.parentId && !!c.resolvedAt)
    if (!opts.showResolved && resolved) continue

    const list = byView.get(viewId) ?? byView.set(viewId, []).get(viewId)!
    list.push({
      viewId,
      num,
      comments,
      answersKq: ans?.answersKq ?? null,
      enablesAction: ans?.enablesAction ?? null,
      resolved,
    })
  }

  return [...byView.keys()]
    .sort()
    .map((viewId) => ({
      viewId,
      items: byView
        .get(viewId)!
        .sort((a, b) =>
          a.num.localeCompare(b.num, undefined, { numeric: true }),
        ),
    }))
}

const TSV_HEADER = [
  "View",
  "Element #",
  "Element",
  "Type",
  "Related KQs",
  "Answers the KQ?",
  "Enables action?",
  "What works",
  "What needs to change",
  "What's missing",
  "Decision",
]

function buildTsv(data: MockupData): string {
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
      answer?.answersKq || "",
      answer?.enablesAction || "",
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
      "",
      `${c.reviewerName}: ${c.body} (confidence ${c.confidence ?? 0}/5)`,
      "",
      "",
      "",
    ])
  }

  return rows.map((r) => r.join("\t")).join("\n")
}
