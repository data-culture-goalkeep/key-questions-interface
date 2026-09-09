"use client"

import * as React from "react"
import Link from "next/link"

import { buildView, elementsForView } from "@/lib/mockup/build-view"
import { KEY_QUESTIONS, kqIdsFor } from "@/lib/mockup/content/key-questions"
import { viewById } from "@/lib/mockup/content/views"
import { addComment, setElementAnswer } from "@/lib/mockup/actions"
import type { AnswerValue, MockupData } from "@/lib/mockup/types"

import {
  answerFor,
  countReviewed,
  elementThread,
  overallFeedback,
  totalComments,
  useMockup,
} from "../mockup-provider"
import { EditableCommentBody } from "./comment-item"
import { avatarStyle, initial, relativeTime } from "./ui"

const ANSWER_LABELS: { value: AnswerValue; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "partly", label: "Partly" },
  { value: "no", label: "No" },
]

function useRunAction() {
  const [pending, setPending] = React.useState(false)
  const run = React.useCallback(async (fn: () => Promise<void>) => {
    setPending(true)
    try {
      await fn()
    } finally {
      setPending(false)
    }
  }, [])
  return { pending, run }
}

export function ReviewRail({ viewId }: { viewId: string }) {
  const mk = useMockup()
  const { data, reviewerId, focus } = mk
  const view = viewById(viewId)
  if (!data || !view) return null

  const inventory = view.kind === "view" ? elementsForView(viewId, mk.filtersForView(viewId)) : []
  const answeredCount = inventory.filter(
    (e) => answerFor(data, reviewerId, viewId, e.num)?.verdict,
  ).length
  const progress = inventory.length ? `${answeredCount}/${inventory.length}` : "—"

  return (
    <div
      style={{
        position: "sticky",
        top: 81,
        height: "calc(100vh - 81px)",
        overflowY: "auto",
        background: "var(--mk-surface)",
        borderLeft: "1px solid var(--mk-border)",
        padding: "15px 16px 30px",
      }}
    >
      {/* Collapse handle — centred on the rail's left edge. */}
      <button
        type="button"
        onClick={mk.toggleRail}
        aria-label="Collapse review rail"
        title="Collapse review rail"
        style={{
          position: "fixed",
          right: 320 - 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 24,
          height: 40,
          borderRadius: 6,
          border: "1px solid var(--mk-border)",
          background: "var(--mk-surface)",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          color: "var(--mk-sec)",
          zIndex: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        }}
      >
        »
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 13,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".07em",
            textTransform: "uppercase",
            color: "var(--mk-sec)",
          }}
        >
          Review
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--mk-border)" }} />
        <span
          className="mk-mono"
          style={{ fontSize: 11, fontWeight: 600, color: "var(--mk-sec)" }}
        >
          {progress}
        </span>
      </div>

      {focus ? (
        // Remount per element so the answer draft state seeds fresh.
        <FocusedPanel
          key={`${viewId}:${focus}`}
          viewId={viewId}
          elementNum={focus}
        />
      ) : (
        <PagePanel viewId={viewId} />
      )}

      <RailFooter />
    </div>
  )
}

// ---------------------------------------------------------------------------

function FocusedPanel({
  viewId,
  elementNum,
}: {
  viewId: string
  elementNum: string
}) {
  const mk = useMockup()
  const { data, reviewerId, mutate, setFocus } = mk
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const [kqOpen, setKqOpen] = React.useState(true)
  const answerRun = useRunAction()
  const commentRun = useRunAction()

  const card = React.useMemo(() => {
    for (const s of buildView(viewId, mk.filtersForView(viewId)))
      for (const c of s.cards) if (c.num === elementNum) return c
    return null
  }, [viewId, elementNum, mk])

  const savedVerdict = data
    ? (answerFor(data, reviewerId, viewId, elementNum)?.verdict ?? null)
    : null

  // Local verdict draft — saved explicitly, independent of any comment.
  const [draftVerdict, setDraftVerdict] = React.useState<AnswerValue | null>(
    savedVerdict,
  )

  if (!data || !card) return null

  const label = (card.kq || "").trim()
  const ids = kqIdsFor(label)
  const thread = elementThread(data, viewId, elementNum)
  const verdictDirty = draftVerdict !== savedVerdict

  function saveVerdict() {
    if (!reviewerId || !verdictDirty || !draftVerdict) return
    const verdict = draftVerdict
    const optimistic = { id: crypto.randomUUID(), now: new Date().toISOString() }
    answerRun.run(() =>
      mutate(
        (d) => patchAnswer(d, reviewerId, viewId, elementNum, verdict, optimistic),
        () => setElementAnswer({ reviewerId, viewId, elementNum, verdict }),
      ),
    )
  }

  function submitComment() {
    if (!reviewerId || !draft.trim()) return
    const body = draft.trim()
    const parentId = replyTo
      ? (thread.find((c) => c.reviewerName === replyTo && !c.parentId)?.id ??
        null)
      : null
    const optimistic = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      reviewerId: reviewerId as string,
      reviewerName: mk.reviewerName,
    }
    commentRun.run(() =>
      mutate(
        (d) => ({
          ...d,
          comments: [
            ...d.comments,
            {
              id: optimistic.id,
              reviewerId: optimistic.reviewerId,
              reviewerName: optimistic.reviewerName,
              scope: "element" as const,
              viewId,
              elementNum,
              parentId,
              body,
              confidence: null,
              isExample: false,
              resolvedAt: null,
              createdAt: optimistic.createdAt,
              editedAt: null,
            },
          ],
        }),
        () =>
          addComment({
            reviewerId,
            scope: "element",
            viewId,
            elementNum,
            parentId,
            body,
          }),
      ),
    )
    setDraft("")
    setReplyTo(null)
  }

  return (
    <div>
      {/* Close sits outside the grey panel so it's clear it dismisses the
          whole element review (info + question + thread). */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
        <button
          type="button"
          onClick={() => setFocus(null)}
          style={{
            border: 0,
            background: "transparent",
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--mk-sec)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Close <span style={{ fontSize: 13 }}>&times;</span>
        </button>
      </div>

      <div
        style={{
          padding: "11px 12px",
          borderRadius: 9,
          background: "var(--mk-canvas)",
          marginBottom: 13,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 7,
          }}
        >
          <span
            className="mk-mono"
            style={{ fontSize: 10, fontWeight: 700, color: "var(--mk-blue)" }}
          >
            {card.num}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>
            {card.name}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: ids.length && kqOpen ? 8 : 0,
          }}
        >
          <span
            className="mk-mono"
            style={{
              fontSize: 9,
              letterSpacing: ".05em",
              textTransform: "uppercase",
              padding: "2px 5px",
              borderRadius: 3,
              background: "var(--mk-border)",
              color: "var(--mk-sec)",
              fontWeight: 600,
            }}
          >
            {card.kind}
          </span>
          {label && (
            <span
              className="mk-mono"
              style={{ fontSize: 10, fontWeight: 600, color: "var(--mk-blue)" }}
            >
              {label}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => setKqOpen((o) => !o)}
            aria-label={kqOpen ? "Collapse key questions" : "Expand key questions"}
            aria-expanded={kqOpen}
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              fontSize: 11,
              lineHeight: 1,
              color: "var(--mk-sec)",
              padding: 2,
            }}
          >
            {kqOpen ? "▾" : "▸"}
          </button>
        </div>
        {kqOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ids.length ? (
              ids.map((id) => (
                <div
                  key={id}
                  style={
                    ids.length > 1
                      ? {
                          padding: "8px 9px",
                          borderRadius: 7,
                          background: "#fff",
                          border: "1px solid var(--mk-border)",
                        }
                      : undefined
                  }
                >
                  <div style={{ display: "flex", gap: 7 }}>
                    {ids.length > 1 && (
                      <span
                        className="mk-mono"
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: "var(--mk-blue)",
                          flex: "none",
                        }}
                      >
                        {id}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        lineHeight: 1.45,
                        color: "var(--mk-ink)",
                        minWidth: 0,
                      }}
                    >
                      {KEY_QUESTIONS[id].question}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: "1px solid var(--mk-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        color: "var(--mk-sec)",
                        marginBottom: 5,
                      }}
                    >
                      Action this should enable
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        lineHeight: 1.5,
                        color: "var(--mk-sec)",
                      }}
                    >
                      {KEY_QUESTIONS[id].action}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span
                style={{ fontSize: 12, lineHeight: 1.45, color: "var(--mk-sec)" }}
              >
                No key question is mapped to this element.
              </span>
            )}
          </div>
        )}
      </div>

      <AnswerRow
        title="Is this chart good to go?"
        current={draftVerdict}
        disabled={answerRun.pending || !reviewerId}
        onPick={setDraftVerdict}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 4,
        }}
      >
        <button
          type="button"
          onClick={saveVerdict}
          disabled={!verdictDirty || answerRun.pending || !reviewerId}
          style={{
            padding: "6px 14px",
            borderRadius: 7,
            border: 0,
            background:
              verdictDirty && !answerRun.pending ? "var(--mk-ink)" : "#d8d6d6",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: verdictDirty && !answerRun.pending ? "pointer" : "default",
          }}
        >
          {answerRun.pending ? "Saving…" : "Save answer"}
        </button>
        {!verdictDirty && draftVerdict && (
          <span style={{ fontSize: 11, color: "var(--mk-good-fg)" }}>Saved</span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "15px 0 9px",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--mk-sec)",
          }}
        >
          Thread
        </span>
        <span
          className="mk-mono"
          style={{ fontSize: 10.5, color: "var(--mk-sec)" }}
        >
          {thread.length}
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--mk-border)" }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          marginBottom: 11,
        }}
      >
        {thread.map((cm) => (
          <div
            key={cm.id}
            style={{
              padding: "10px 11px",
              border: "1px solid var(--mk-border)",
              borderRadius: 9,
              marginLeft: cm.parentId ? 14 : 0,
              background: cm.parentId ? "var(--mk-canvas)" : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 5,
              }}
            >
              <span style={avatarStyle(cm.reviewerName, 20)}>
                {initial(cm.reviewerName)}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                {cm.reviewerName}
              </span>
              <span style={{ fontSize: 10, color: "var(--mk-muted)" }}>
                {relativeTime(cm.createdAt)}
              </span>
              <div style={{ flex: 1 }} />
              {cm.isExample && (
                <span
                  className="mk-mono"
                  style={{
                    fontSize: 8.5,
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
              {!cm.parentId && (
                <button
                  type="button"
                  onClick={() => setReplyTo(cm.reviewerName)}
                  style={{
                    border: 0,
                    background: "transparent",
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "var(--mk-blue)",
                    cursor: "pointer",
                  }}
                >
                  Reply
                </button>
              )}
            </div>
            <EditableCommentBody comment={cm} />
          </div>
        ))}
      </div>

      <div
        style={{
          border: "1px solid var(--mk-border)",
          borderRadius: 9,
          padding: "9px 10px",
        }}
      >
        {replyTo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 7,
              padding: "4px 7px",
              borderRadius: 5,
              background: "var(--mk-canvas)",
            }}
          >
            <span style={{ fontSize: 10.5, color: "var(--mk-sec)" }}>
              Replying to {replyTo}
            </span>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
              style={{
                border: 0,
                background: "transparent",
                fontSize: 12,
                color: "var(--mk-muted)",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
        )}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What works, what needs to change, what's missing…"
          style={{
            width: "100%",
            minHeight: 62,
            padding: 0,
            border: 0,
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--mk-ink)",
            resize: "vertical",
            outline: "none",
            background: "transparent",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginTop: 7,
          }}
        >
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={submitComment}
            disabled={!draft.trim() || commentRun.pending || !reviewerId}
            style={{
              padding: "6px 13px",
              borderRadius: 7,
              border: 0,
              background:
                draft.trim() && !commentRun.pending
                  ? "var(--mk-ink)"
                  : "#d8d6d6",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: draft.trim() ? "pointer" : "default",
            }}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  )
}


function AnswerRow({
  title,
  current,
  disabled,
  onPick,
}: {
  title: string
  current: AnswerValue | null
  disabled: boolean
  onPick: (v: AnswerValue) => void
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {ANSWER_LABELS.map((a) => {
          const on = current === a.value
          const activeBg =
            a.value === "yes" ? "var(--mk-blue)" : "var(--mk-bad-bg)"
          const activeFg = a.value === "yes" ? "#fff" : "var(--mk-bad-fg)"
          const activeBorder =
            a.value === "yes"
              ? "var(--mk-blue)"
              : a.value === "partly"
                ? "var(--mk-coral)"
                : "var(--mk-danger)"
          return (
            <button
              key={a.value}
              type="button"
              disabled={disabled}
              onClick={() => onPick(a.value)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "7px 0",
                border: `1px solid ${on ? activeBorder : "var(--mk-border)"}`,
                borderRadius: 7,
                background: on ? activeBg : "#fff",
                color: on ? activeFg : "var(--mk-sec)",
                fontSize: 12,
                fontWeight: on ? 600 : 500,
                cursor: disabled ? "default" : "pointer",
              }}
            >
              {a.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function PagePanel({ viewId }: { viewId: string }) {
  const view = viewById(viewId)
  if (!view) return null
  const isReviewPage = view.kind === "view"
  return (
    <div
      style={{
        padding: "12px 13px",
        borderRadius: 9,
        background: "var(--mk-canvas)",
        marginBottom: 13,
      }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
        {view.title}
      </div>
      <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--mk-sec)" }}>
        {isReviewPage
          ? "Click any element on the left to review it. Page-level feedback for the whole view is at the bottom of the page."
          : "This is reference material — no element-level review needed here."}
      </div>
    </div>
  )
}


export function ConfidenceScale({
  value,
  onPick,
}: {
  value: number
  onPick: (n: number) => void
}) {
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPick(n)}
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${value === n ? "var(--mk-blue)" : "var(--mk-border)"}`,
            borderRadius: 7,
            background: value === n ? "var(--mk-blue)" : "#fff",
            color: value === n ? "#fff" : "var(--mk-sec)",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------

function RailFooter() {
  const { data } = useMockup()
  const total = data ? totalComments(data) : 0
  return (
    <div
      style={{
        marginTop: 22,
        paddingTop: 15,
        borderTop: "1px solid var(--mk-border)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <Link href="/mockups/sandipani/log" style={{ fontSize: 11.5 }}>
        Feedback log ({total}) →
      </Link>
      <Link href="/mockups/sandipani/matrix" style={{ fontSize: 11.5 }}>
        Response matrix →
      </Link>
      <Link href="/mockups/sandipani/coverage" style={{ fontSize: 11.5 }}>
        Coverage check →
      </Link>
      <Link href="/mockups" style={{ fontSize: 11.5 }}>
        Review brief →
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------

function patchAnswer(
  d: MockupData,
  reviewerId: string,
  viewId: string,
  elementNum: string,
  verdict: AnswerValue,
  optimistic: { id: string; now: string },
): MockupData {
  const idx = d.answers.findIndex(
    (a) =>
      a.reviewerId === reviewerId &&
      a.viewId === viewId &&
      a.elementNum === elementNum,
  )
  const answers = [...d.answers]
  if (idx >= 0) {
    answers[idx] = { ...answers[idx], verdict }
  } else {
    answers.push({
      id: optimistic.id,
      reviewerId,
      viewId,
      elementNum,
      verdict,
      updatedAt: optimistic.now,
    })
  }
  return { ...d, answers }
}

// re-exported so overall-feedback card can reuse the scale + selectors
export { overallFeedback, countReviewed }
