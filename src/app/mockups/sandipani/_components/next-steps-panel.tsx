"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { saveSummaryAnnotations } from "@/lib/mockup/actions"
import { summarizeNextSteps } from "@/lib/mockup/summarize"
import type { MockupSummary, SummaryRowAnnotation } from "@/lib/mockup/types"

import { useMockup } from "../mockup-provider"
import { relativeTime } from "./ui"

// ---------------------------------------------------------------------------
// Markdown-table parsing
// ---------------------------------------------------------------------------

interface ParsedTable {
  headers: string[]
  rows: { key: string; cells: string[] }[]
}

function splitRow(line: string): string[] {
  const t = line.trim().replace(/^\|/, "").replace(/\|$/, "")
  return t.split("|").map((c) => c.trim().replace(/\\\|/g, "|"))
}

const isSeparator = (cells: string[]) =>
  cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c))

/** Parse Claude's GFM table. Returns null if the text isn't a table. */
function parseMarkdownTable(md: string): ParsedTable | null {
  const lines = md.split("\n").filter((l) => l.trim().startsWith("|"))
  if (lines.length < 2) return null
  const headers = splitRow(lines[0])
  let start = 1
  if (isSeparator(splitRow(lines[1]))) start = 2
  const rows: { key: string; cells: string[] }[] = []
  const seen = new Set<string>()
  for (let i = start; i < lines.length; i++) {
    const cells = splitRow(lines[i])
    if (cells.length === 0 || cells.every((c) => c === "")) continue
    let key = cells[0].replace(/\*/g, "").trim()
    if (!key || seen.has(key)) key = String(rows.length + 1)
    seen.add(key)
    rows.push({ key, cells })
  }
  return rows.length > 0 ? { headers, rows } : null
}

const cellText = (s: string) => s.replace(/\*\*/g, "")

// ---------------------------------------------------------------------------
// Annotation helpers
// ---------------------------------------------------------------------------

const EMPTY: SummaryRowAnnotation = {
  confirmed: false,
  instructions: "",
  incorporatedRound: null,
  incorporatedAt: null,
  changeMade: "",
}

type AnnoMap = Record<string, SummaryRowAnnotation>

function cloneAnnos(a: AnnoMap): AnnoMap {
  return Object.fromEntries(Object.entries(a).map(([k, v]) => [k, { ...v }]))
}

/** Keep only meaningful entries for keys that still exist in the table. */
function prune(a: AnnoMap, keys: string[]): AnnoMap {
  const set = new Set(keys)
  const out: AnnoMap = {}
  for (const [k, v] of Object.entries(a)) {
    if (!set.has(k)) continue
    if (v.confirmed || v.instructions.trim() || v.incorporatedRound != null)
      out[k] = v
  }
  return out
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export function NextStepsPanel() {
  const { data, mutate } = useMockup()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!data) return null
  const flagged = data.comments.filter(
    (c) => c.toIncorporate && !c.incorporatedAt,
  ).length
  const summary = data.latestSummary

  async function run() {
    setPending(true)
    setError(null)
    try {
      const result = await summarizeNextSteps()
      if ("error" in result) {
        setError(result.error)
        return
      }
      // Fold the result into the cache through mutate() so every state update
      // stays inside a transition.
      await mutate(
        (d) => ({ ...d, latestSummary: result.summary }),
        async () => {},
      )
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't generate the summary.",
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      style={{
        marginTop: 24,
        background: "var(--mk-surface)",
        border: "1px solid var(--mk-border)",
        borderRadius: 12,
        borderTop: "3px solid var(--mk-blue)",
        padding: "20px 22px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 600 }}>
            Next steps
          </h2>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--mk-sec)" }}>
            Collates every <strong>pending</strong> comment marked{" "}
            <strong>&ldquo;To be incorporated&rdquo;</strong> ({flagged} pending)
            and asks Claude for a change list. Rows lock once their change
            ships.
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={run}
          disabled={pending || flagged === 0}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: 0,
            background: !pending && flagged > 0 ? "var(--mk-ink)" : "#d8d6d6",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: !pending && flagged > 0 ? "pointer" : "default",
            whiteSpace: "nowrap",
          }}
        >
          {pending ? "Summarizing…" : "Summarize Next Steps"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--mk-bad-fg)" }}>
          {error}
        </div>
      )}

      {pending && (
        <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--mk-sec)" }}>
          Sending {flagged} comment{flagged === 1 ? "" : "s"} to Claude — this
          takes a few seconds…
        </div>
      )}

      {summary && !pending && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--mk-sec)",
              marginBottom: 10,
            }}
          >
            Generated {relativeTime(summary.createdAt)} · from{" "}
            {summary.commentCount} comment
            {summary.commentCount === 1 ? "" : "s"}
          </div>
          <SummaryTable key={summary.id} summary={summary} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editable table (remounts per summary via `key`)
// ---------------------------------------------------------------------------

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "7px 10px",
  borderBottom: "1px solid var(--mk-border)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  color: "var(--mk-sec)",
  verticalAlign: "bottom",
  whiteSpace: "nowrap",
}
const td: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--mk-border)",
  fontSize: 12.5,
  lineHeight: 1.45,
  verticalAlign: "top",
}

function SummaryTable({ summary }: { summary: MockupSummary }) {
  const { mutate } = useMockup()
  const parsed = React.useMemo(
    () => parseMarkdownTable(summary.content),
    [summary.content],
  )
  const [annos, setAnnos] = React.useState<AnnoMap>(() =>
    cloneAnnos(summary.rowAnnotations),
  )
  const [saving, setSaving] = React.useState(false)
  const [saveErr, setSaveErr] = React.useState<string | null>(null)

  // Claude returned prose, not a table — show it as-is, no data entry.
  if (!parsed) {
    return (
      <div className="mk-md">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {summary.content}
        </ReactMarkdown>
      </div>
    )
  }

  const keys = parsed.rows.map((r) => r.key)
  const get = (k: string) => annos[k] ?? EMPTY
  const patch = (k: string, p: Partial<SummaryRowAnnotation>) =>
    setAnnos((a) => ({ ...a, [k]: { ...(a[k] ?? EMPTY), ...p } }))

  const next = prune(annos, keys)
  const dirty =
    JSON.stringify(next) !== JSON.stringify(prune(summary.rowAnnotations, keys))

  // Sort: by incorporation round (unincorporated last), then area of enquiry,
  // then original row number. Round + timestamp come from the saved
  // annotations, not local edits, so the order is stable while the team types.
  const areaIdx = Math.max(
    0,
    parsed.headers.findIndex((h) => /area/i.test(h)),
  )
  const roundOf = (k: string) =>
    summary.rowAnnotations[k]?.incorporatedRound ?? Infinity
  const sortedRows = [...parsed.rows].sort((a, b) => {
    const ra = roundOf(a.key)
    const rb = roundOf(b.key)
    if (ra !== rb) return ra - rb
    const ca = cellText(a.cells[areaIdx] ?? "")
    const cb = cellText(b.cells[areaIdx] ?? "")
    const byArea = ca.localeCompare(cb, undefined, { numeric: true })
    if (byArea) return byArea
    return Number(a.key) - Number(b.key)
  })

  const colCount = parsed.headers.length + 3

  async function save() {
    setSaving(true)
    setSaveErr(null)
    const payload = prune(annos, keys)
    const res = await saveSummaryAnnotations({
      summaryId: summary.id,
      annotations: payload,
    })
    if ("error" in res) {
      setSaveErr(res.error)
      setSaving(false)
      return
    }
    await mutate(
      (d) =>
        d.latestSummary && d.latestSummary.id === summary.id
          ? {
              ...d,
              latestSummary: { ...d.latestSummary, rowAnnotations: payload },
            }
          : d,
      async () => {},
    )
    setSaving(false)
  }

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: 900,
          }}
        >
          <thead>
            <tr>
              {parsed.headers.map((h, i) => (
                <th key={i} style={th}>
                  {cellText(h)}
                </th>
              ))}
              <th style={{ ...th, textAlign: "center" }}>Confirm</th>
              <th style={th}>Instructions</th>
              <th style={th}>Change made</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, idx) => {
              const a = get(row.key)
              const saved = summary.rowAnnotations[row.key]
              const round = saved?.incorporatedRound ?? null
              const locked = round != null
              const prevRound =
                idx === 0
                  ? undefined
                  : (summary.rowAnnotations[sortedRows[idx - 1].key]
                      ?.incorporatedRound ?? null)
              const showHeader = idx === 0 || round !== prevRound
              return (
                <React.Fragment key={row.key}>
                  {showHeader && (
                    <tr>
                      <td
                        colSpan={colCount}
                        style={{
                          padding: "10px 10px 5px",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: ".04em",
                          textTransform: "uppercase",
                          color: locked ? "var(--mk-blue)" : "var(--mk-sec)",
                          borderBottom: "1px solid var(--mk-border)",
                        }}
                      >
                        {locked && saved?.incorporatedAt
                          ? `Round ${round} · incorporated ${fmtDate(saved.incorporatedAt)}`
                          : "Not yet incorporated"}
                      </td>
                    </tr>
                  )}
                  <tr
                    style={{
                      background:
                        locked || a.confirmed
                          ? "var(--mk-blue-tint)"
                          : "transparent",
                      opacity: locked ? 0.75 : 1,
                    }}
                  >
                    {parsed.headers.map((_, i) => (
                      <td key={i} style={td}>
                        {cellText(row.cells[i] ?? "")}
                      </td>
                    ))}
                    <td style={{ ...td, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={locked ? true : a.confirmed}
                        disabled={locked}
                        onChange={(e) =>
                          patch(row.key, { confirmed: e.target.checked })
                        }
                        style={{
                          width: 15,
                          height: 15,
                          cursor: locked ? "default" : "pointer",
                        }}
                        aria-label={`Confirm row ${row.key}`}
                      />
                    </td>
                    <td style={td}>
                      {locked ? (
                        <span
                          style={{
                            color: "var(--mk-sec)",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {a.instructions || "—"}
                        </span>
                      ) : (
                        <textarea
                          value={a.instructions}
                          onChange={(e) =>
                            patch(row.key, { instructions: e.target.value })
                          }
                          rows={2}
                          placeholder="Add instructions…"
                          style={{
                            width: 220,
                            minHeight: 40,
                            resize: "vertical",
                            border: "1px solid var(--mk-border)",
                            borderRadius: 6,
                            padding: "5px 7px",
                            fontSize: 12,
                            fontFamily: "inherit",
                            color: "var(--mk-ink)",
                            background: "#fff",
                          }}
                        />
                      )}
                    </td>
                    <td style={{ ...td, minWidth: 200 }}>
                      {locked ? (
                        <div>
                          <div>{saved?.changeMade || "—"}</div>
                          {saved?.incorporatedAt && (
                            <div
                              style={{
                                marginTop: 3,
                                fontSize: 10.5,
                                color: "var(--mk-muted)",
                              }}
                              title={saved.incorporatedAt}
                            >
                              {fmtDate(saved.incorporatedAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--mk-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 12,
        }}
      >
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: 0,
            background: dirty && !saving ? "var(--mk-blue)" : "#d8d6d6",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: dirty && !saving ? "pointer" : "default",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saveErr ? (
          <span style={{ fontSize: 12, color: "var(--mk-bad-fg)" }}>
            {saveErr}
          </span>
        ) : dirty ? (
          <span style={{ fontSize: 12, color: "var(--mk-sec)" }}>
            Unsaved changes
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "var(--mk-sec)" }}>
            All changes saved
          </span>
        )}
      </div>
    </div>
  )
}
