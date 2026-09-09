"use client"

import * as React from "react"

import { elementsForView } from "@/lib/mockup/build-view"
import { DEFAULT_FILTERS } from "@/lib/mockup/content/scenarios"
import { DASHBOARD_VIEWS } from "@/lib/mockup/content/views"
import type { AnswerValue } from "@/lib/mockup/types"

import { useMockup } from "../mockup-provider"

// Grid: one row per chart, one column per reviewer. Each cell shows that
// reviewer's single verdict ("Is this chart good to go?") as an icon.

const ELEMENTS = DASHBOARD_VIEWS.map((v) => ({
  view: v,
  elements: elementsForView(v.id, DEFAULT_FILTERS),
}))
const TOTAL_ELEMENTS = ELEMENTS.reduce((a, e) => a + e.elements.length, 0)

const ICON: Record<
  AnswerValue,
  { bg: string; fg: string; sym: string; label: string }
> = {
  yes: { bg: "var(--mk-good-bg)", fg: "var(--mk-good-fg)", sym: "✓", label: "Good to go" },
  partly: { bg: "#FBF1E4", fg: "#9A6B1F", sym: "~", label: "Partly" },
  no: { bg: "var(--mk-bad-bg)", fg: "var(--mk-bad-fg)", sym: "✕", label: "Not yet" },
}

function VerdictIcon({ value }: { value: AnswerValue | null }) {
  if (!value)
    return (
      <span
        title="Not answered"
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: "1px dashed var(--mk-border)",
          display: "inline-block",
        }}
      />
    )
  const s = ICON[value]
  return (
    <span
      title={s.label}
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        background: s.bg,
        color: s.fg,
        fontSize: 11,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {s.sym}
    </span>
  )
}

export function MatrixBody() {
  const { data } = useMockup()

  const reviewers = React.useMemo(
    () =>
      data
        ? [...data.reviewers].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [data],
  )

  const verdictAt = React.useMemo(() => {
    const m = new Map<string, AnswerValue | null>()
    for (const a of data?.answers ?? [])
      m.set(`${a.reviewerId}:${a.viewId}:${a.elementNum}`, a.verdict)
    return m
  }, [data])

  // Elements with at least one verdict from any reviewer.
  const reviewedElements = React.useMemo(() => {
    const seen = new Set<string>()
    for (const a of data?.answers ?? [])
      if (a.verdict) seen.add(`${a.viewId}:${a.elementNum}`)
    return seen.size
  }, [data])

  if (!data) return null

  const firstColW = 260
  const colW = 68

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: "var(--mk-surface)",
            border: "1px solid var(--mk-border)",
            borderRadius: 11,
            padding: "12px 18px",
          }}
        >
          <div
            style={{ fontSize: 11.5, color: "var(--mk-sec)", marginBottom: 4 }}
          >
            Elements reviewed at least once
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-.02em",
              lineHeight: 1,
            }}
          >
            {reviewedElements}
            <span
              style={{ fontSize: 15, fontWeight: 500, color: "var(--mk-sec)" }}
            >
              {" "}
              / {TOTAL_ELEMENTS}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            fontSize: 11.5,
            color: "var(--mk-sec)",
          }}
        >
          <LegendChip {...ICON.yes} label="Good to go" />
          <LegendChip {...ICON.partly} label="Partly" />
          <LegendChip {...ICON.no} label="Not yet" />
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: "1px dashed var(--mk-border)",
              display: "inline-block",
            }}
          />
          <span>not answered</span>
        </div>
      </div>

      <div
        style={{
          overflow: "auto",
          maxHeight: "calc(100vh - 260px)",
          border: "1px solid var(--mk-border)",
          borderRadius: 10,
          background: "var(--mk-surface)",
        }}
      >
        <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th
                style={{
                  position: "sticky",
                  left: 0,
                  top: 0,
                  zIndex: 3,
                  background: "var(--mk-surface)",
                  minWidth: firstColW,
                  maxWidth: firstColW,
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--mk-sec)",
                  borderBottom: "1px solid var(--mk-border)",
                  borderRight: "1px solid var(--mk-border)",
                }}
              >
                Chart
              </th>
              {reviewers.map((r) => (
                <th
                  key={r.id}
                  title={r.name}
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "var(--mk-surface)",
                    minWidth: colW,
                    maxWidth: colW,
                    padding: "8px 4px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--mk-ink)",
                    borderBottom: "1px solid var(--mk-border)",
                    borderLeft: "1px solid var(--mk-border-hair)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ELEMENTS.map(({ view, elements }) => (
              <React.Fragment key={view.id}>
                <tr>
                  <td
                    colSpan={reviewers.length + 1}
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "var(--mk-canvas)",
                      padding: "6px 12px",
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "var(--mk-sec)",
                      borderBottom: "1px solid var(--mk-border)",
                      borderTop: "1px solid var(--mk-border)",
                    }}
                  >
                    {view.label}
                  </td>
                </tr>
                {elements.map((el) => (
                  <tr key={el.num}>
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        background: "var(--mk-surface)",
                        minWidth: firstColW,
                        maxWidth: firstColW,
                        padding: "6px 12px",
                        borderBottom: "1px solid var(--mk-border-hair)",
                        borderRight: "1px solid var(--mk-border)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={`${el.num} ${el.name}`}
                    >
                      <span
                        className="mk-mono"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--mk-blue)",
                          marginRight: 6,
                        }}
                      >
                        {el.num}
                      </span>
                      <span style={{ fontSize: 12 }}>{el.name}</span>
                    </td>
                    {reviewers.map((r) => (
                      <td
                        key={r.id}
                        style={{
                          padding: "6px 4px",
                          textAlign: "center",
                          borderBottom: "1px solid var(--mk-border-hair)",
                          borderLeft: "1px solid var(--mk-border-hair)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <VerdictIcon
                          value={
                            verdictAt.get(`${r.id}:${view.id}:${el.num}`) ?? null
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LegendChip({
  bg,
  fg,
  sym,
  label,
}: {
  bg: string
  fg: string
  sym: string
  label: string
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: bg,
          color: fg,
          fontSize: 11,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {sym}
      </span>
      {label}
    </span>
  )
}
