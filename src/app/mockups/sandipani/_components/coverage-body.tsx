"use client"

import * as React from "react"

import { elementsForView } from "@/lib/mockup/build-view"
import { DEFAULT_FILTERS } from "@/lib/mockup/content/scenarios"
import {
  KEY_QUESTIONS,
  kqLabelCovers,
} from "@/lib/mockup/content/key-questions"
import { DASHBOARD_VIEWS } from "@/lib/mockup/content/views"

import { answerFor, useMockup } from "../mockup-provider"

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "9px 17px",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: ".05em",
  textTransform: "uppercase",
  color: "var(--mk-sec)",
  borderBottom: "1px solid var(--mk-border)",
}

interface KqCoverage {
  id: string
  question: string
  elements: { viewId: string; num: string }[]
}

function coverageIndex(): KqCoverage[] {
  return Object.keys(KEY_QUESTIONS).map((id) => {
    const elements: { viewId: string; num: string }[] = []
    for (const v of DASHBOARD_VIEWS) {
      if (!v.kqs.includes(id)) continue
      for (const e of elementsForView(v.id, DEFAULT_FILTERS)) {
        if (kqLabelCovers(e.kq, id)) elements.push({ viewId: v.id, num: e.num })
      }
    }
    return { id, question: KEY_QUESTIONS[id].question, elements }
  })
}

export function CoverageBody() {
  const { data, reviewerId } = useMockup()
  const rows = React.useMemo(() => coverageIndex(), [])

  return (
    <div
      style={{
        background: "var(--mk-surface)",
        border: "1px solid var(--mk-border)",
        borderRadius: 11,
        overflow: "hidden",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          padding: "15px 17px",
          borderBottom: "1px solid var(--mk-border-soft)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>
          Key question → chart coverage
        </div>
        <div style={{ fontSize: 12, color: "var(--mk-sec)" }}>
          Every prioritised key question, the elements that answer it, and where
          the review currently stands. KQ09, KQ14 and KQ18–KQ20 were dropped from
          scope.
        </div>
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}
      >
        <thead>
          <tr>
            <th style={th}>KQ</th>
            <th style={{ ...th, padding: "9px 10px" }}>Question</th>
            <th style={{ ...th, padding: "9px 10px" }}>Elements</th>
            <th style={th}>Reviewed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const reviewed = data
              ? r.elements.filter(
                  (e) =>
                    answerFor(data, reviewerId, e.viewId, e.num)?.answersKq,
                ).length
              : 0
            const noChart = r.elements.length === 0
            const complete = !noChart && reviewed === r.elements.length
            const badge = noChart
              ? "no chart"
              : `${reviewed} of ${r.elements.length}`
            return (
              <tr key={r.id}>
                <td
                  className="mk-mono"
                  style={{
                    padding: "11px 17px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--mk-blue)",
                    verticalAlign: "top",
                  }}
                >
                  {r.id}
                </td>
                <td
                  style={{
                    padding: "11px 10px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                    lineHeight: 1.5,
                    maxWidth: "44ch",
                  }}
                >
                  {r.question}
                </td>
                <td
                  className="mk-mono"
                  style={{
                    padding: "11px 10px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                    fontSize: 11,
                    color: "var(--mk-sec)",
                    lineHeight: 1.6,
                    maxWidth: "24ch",
                  }}
                >
                  {r.elements.length
                    ? r.elements.map((e) => e.num).join(" · ")
                    : "—"}
                </td>
                <td
                  style={{
                    padding: "11px 17px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 5,
                      fontSize: 10.5,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      background: noChart
                        ? "var(--mk-bad-bg)"
                        : complete
                          ? "var(--mk-good-bg)"
                          : "var(--mk-border-soft)",
                      color: noChart
                        ? "var(--mk-bad-fg)"
                        : complete
                          ? "var(--mk-good-fg)"
                          : "var(--mk-sec)",
                    }}
                  >
                    {badge}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
