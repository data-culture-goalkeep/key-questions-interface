"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { summarizeNextSteps } from "@/lib/mockup/summarize"

import { useMockup } from "../mockup-provider"
import { relativeTime } from "./ui"

export function NextStepsPanel() {
  const { data, refresh } = useMockup()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!data) return null
  const flagged = data.comments.filter((c) => c.toIncorporate).length
  const summary = data.latestSummary

  async function run() {
    setPending(true)
    setError(null)
    try {
      await summarizeNextSteps()
      await refresh()
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
            Collates every comment marked{" "}
            <strong>&ldquo;To be incorporated&rdquo;</strong> ({flagged} so far)
            and asks Claude for a change list.
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
            background:
              !pending && flagged > 0 ? "var(--mk-ink)" : "#d8d6d6",
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
        <div
          style={{
            marginTop: 12,
            fontSize: 12.5,
            color: "var(--mk-bad-fg)",
          }}
        >
          {error}
        </div>
      )}

      {pending && (
        <div
          style={{
            marginTop: 14,
            fontSize: 12.5,
            color: "var(--mk-sec)",
          }}
        >
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
          <div className="mk-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
