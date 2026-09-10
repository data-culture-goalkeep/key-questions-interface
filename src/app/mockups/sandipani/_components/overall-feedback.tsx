"use client"

import * as React from "react"

import { addComment } from "@/lib/mockup/actions"

import { overallFeedback, useMockup } from "../mockup-provider"
import { EditableCommentBody } from "./comment-item"
import { ConfidenceScale } from "./review-rail"
import { avatarStyle, initial, relativeTime } from "./ui"

const CONF_LABEL = ["", "not at all", "a little", "somewhat", "mostly", "fully"]

export function OverallFeedback() {
  const mk = useMockup()
  const { data, reviewerId, mutate } = mk
  const [draft, setDraft] = React.useState("")
  const [conf, setConf] = React.useState(0)
  const [pending, setPending] = React.useState(false)

  if (!data) return null
  const entries = overallFeedback(data)

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
            scope: "overall" as const,
            viewId: null,
            elementNum: null,
            parentId: null,
            body,
            confidence,
            isExample: false,
            resolvedAt: null,
            createdAt: optimistic.createdAt,
            editedAt: null,
            toIncorporate: false,
            incorporatedAt: null,
          },
        ],
      }),
      () => addComment({ reviewerId, scope: "overall", body, confidence }),
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
        borderTop: "3px solid var(--mk-blue)",
        padding: "22px 24px 24px",
        marginTop: 6,
      }}
    >
      <div
        className="mk-mono"
        style={{
          fontSize: 9.5,
          letterSpacing: ".07em",
          textTransform: "uppercase",
          color: "var(--mk-sec)",
          fontWeight: 600,
          marginBottom: 9,
        }}
      >
        Last view · overall feedback
      </div>
      <h2
        style={{
          margin: "0 0 7px",
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: "-.015em",
        }}
      >
        You&apos;ve reached the end of the dashboard
      </h2>
      <p
        style={{
          margin: "0 0 17px",
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--mk-sec)",
          maxWidth: "74ch",
        }}
      >
        Taken as a whole: is anything missing? Would this dashboard let you take
        the actions in the key questions list? Any concerns about sequencing or
        feasibility?
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Your overall comments on the dashboard…"
        style={{
          width: "100%",
          minHeight: 96,
          padding: "11px 12px",
          border: "1px solid var(--mk-border)",
          borderRadius: 9,
          fontSize: 13,
          lineHeight: 1.55,
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
          gap: 13,
          marginTop: 13,
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 500 }}>
          Confidence this will enable action
        </span>
        <ConfidenceScale value={conf} onPick={setConf} />
        <span style={{ fontSize: 11.5, color: "var(--mk-sec)" }}>
          {conf ? CONF_LABEL[conf] : "1 = not at all · 5 = fully"}
        </span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim() || pending || !reviewerId}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: 0,
            background: draft.trim() && !pending ? "var(--mk-ink)" : "#d8d6d6",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: draft.trim() ? "pointer" : "default",
          }}
        >
          Submit overall feedback
        </button>
      </div>

      {entries.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 9,
            background: "var(--mk-canvas)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "var(--mk-sec)",
              marginBottom: 7,
            }}
          >
            Recorded
          </div>
          {entries.map((o) => (
            <div
              key={o.id}
              style={{
                padding: "9px 0",
                borderTop: "1px solid var(--mk-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 4,
                }}
              >
                <span style={avatarStyle(o.reviewerName, 20)}>
                  {initial(o.reviewerName)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {o.reviewerName}
                </span>
                <span style={{ fontSize: 10.5, color: "var(--mk-muted)" }}>
                  {relativeTime(o.createdAt)}
                </span>
                {o.confidence && (
                  <span
                    className="mk-mono"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--mk-blue)",
                    }}
                  >
                    confidence {o.confidence}/5
                  </span>
                )}
              </div>
              <EditableCommentBody comment={o} fontSize={12.5} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
