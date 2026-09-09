"use client"

import * as React from "react"

import { addComment } from "@/lib/mockup/actions"

import { pageFeedback, useMockup } from "../mockup-provider"
import { EditableCommentBody } from "./comment-item"
import { ConfidenceScale } from "./review-rail"
import { avatarStyle, initial, relativeTime } from "./ui"

/**
 * Whole-view feedback, shown at the bottom of each dashboard view (moved here
 * from the review rail so it reads as "the last thing on the page").
 */
export function PageFeedback({ viewId }: { viewId: string }) {
  const mk = useMockup()
  const { data, reviewerId, mutate } = mk
  const [draft, setDraft] = React.useState("")
  const [conf, setConf] = React.useState(0)
  const [pending, setPending] = React.useState(false)

  if (!data) return null
  const entries = pageFeedback(data, viewId)

  function submit() {
    if (!reviewerId || !draft.trim()) return
    const body = draft.trim()
    const confidence = conf || null
    const optimistic = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      reviewerId: reviewerId as string,
      reviewerName: mk.reviewerName,
    }
    setPending(true)
    mutate(
      (d) => ({
        ...d,
        comments: [
          ...d.comments,
          {
            id: optimistic.id,
            reviewerId: optimistic.reviewerId,
            reviewerName: optimistic.reviewerName,
            scope: "page" as const,
            viewId,
            elementNum: null,
            parentId: null,
            body,
            confidence,
            isExample: false,
            resolvedAt: null,
            createdAt: optimistic.createdAt,
            editedAt: null,
            toIncorporate: false,
          },
        ],
      }),
      () => addComment({ reviewerId, scope: "page", viewId, body, confidence }),
    ).finally(() => setPending(false))
    setDraft("")
    setConf(0)
  }

  return (
    <div
      style={{
        background: "var(--mk-surface)",
        border: "1px solid var(--mk-border)",
        borderRadius: 12,
        padding: "20px 22px 22px",
        marginTop: 8,
      }}
    >
      <h2
        style={{
          margin: "0 0 4px",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Feedback on this view
      </h2>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 12.5,
          color: "var(--mk-sec)",
        }}
      >
        Does this view hold together? Anything missing across it?
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Your feedback on the whole view…"
        style={{
          width: "100%",
          minHeight: 78,
          padding: "10px 11px",
          border: "1px solid var(--mk-border)",
          borderRadius: 9,
          fontSize: 12.5,
          lineHeight: 1.5,
          color: "var(--mk-ink)",
          resize: "vertical",
          outline: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          marginTop: 11,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500 }}>
          Confidence in this view
        </span>
        <ConfidenceScale value={conf} onPick={setConf} />
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim() || pending || !reviewerId}
          style={{
            padding: "8px 15px",
            borderRadius: 8,
            border: 0,
            background: draft.trim() && !pending ? "var(--mk-ink)" : "#d8d6d6",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: draft.trim() ? "pointer" : "default",
          }}
        >
          Save page feedback
        </button>
      </div>

      {entries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--mk-sec)",
              marginBottom: 8,
            }}
          >
            On this view
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "11px 12px",
                  border: "1px solid var(--mk-border)",
                  borderRadius: 9,
                  background: "var(--mk-canvas)",
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
                  <span style={avatarStyle(p.reviewerName, 20)}>
                    {initial(p.reviewerName)}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {p.reviewerName}
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--mk-muted)" }}>
                    {relativeTime(p.createdAt)}
                  </span>
                  <div style={{ flex: 1 }} />
                  {p.confidence && (
                    <span
                      className="mk-mono"
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--mk-blue)",
                      }}
                    >
                      confidence {p.confidence}/5
                    </span>
                  )}
                </div>
                <EditableCommentBody comment={p} fontSize={12.5} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
