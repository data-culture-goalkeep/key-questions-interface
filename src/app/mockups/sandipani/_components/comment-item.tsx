"use client"

import * as React from "react"

import { editComment } from "@/lib/mockup/actions"
import type { MockupComment } from "@/lib/mockup/types"

import { useMockup } from "../mockup-provider"

/**
 * A comment's body text with Slack-style in-place editing. The author (matched
 * by reviewer name) sees an "Edit" affordance; a persisted edit stamps
 * `editedAt`, shown as "(edited)".
 */
export function EditableCommentBody({
  comment,
  fontSize = 12,
}: {
  comment: MockupComment
  fontSize?: number
}) {
  const { mutate, reviewerId, reviewerName } = useMockup()
  const [editing, setEditing] = React.useState(false)
  const [value, setValue] = React.useState(comment.body)
  const [pending, setPending] = React.useState(false)

  const canEdit =
    !!reviewerId && !comment.isExample && comment.reviewerName === reviewerName

  function save() {
    const body = value.trim()
    if (!body || !reviewerId || body === comment.body) {
      setEditing(false)
      setValue(comment.body)
      return
    }
    const editedAt = new Date().toISOString()
    setPending(true)
    mutate(
      (d) => ({
        ...d,
        comments: d.comments.map((c) =>
          c.id === comment.id ? { ...c, body, editedAt } : c,
        ),
      }),
      () => editComment({ commentId: comment.id, reviewerId, body }),
    ).finally(() => setPending(false))
    setEditing(false)
  }

  if (editing) {
    return (
      <div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            minHeight: 54,
            padding: "7px 9px",
            border: "1px solid var(--mk-border)",
            borderRadius: 7,
            fontSize,
            lineHeight: 1.5,
            color: "var(--mk-ink)",
            resize: "vertical",
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 5,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={save}
            disabled={pending || !value.trim()}
            style={{
              padding: "4px 11px",
              borderRadius: 6,
              border: 0,
              background: value.trim() ? "var(--mk-ink)" : "#d8d6d6",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              cursor: value.trim() ? "pointer" : "default",
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setValue(comment.body)
            }}
            style={{
              border: 0,
              background: "transparent",
              fontSize: 11,
              color: "var(--mk-sec)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontSize, lineHeight: 1.5 }}>
      {comment.body}
      {comment.editedAt && (
        <span
          title={`edited ${new Date(comment.editedAt).toLocaleString()}`}
          style={{ color: "var(--mk-muted)", fontSize: fontSize - 2 }}
        >
          {" "}
          (edited)
        </span>
      )}
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            setValue(comment.body)
            setEditing(true)
          }}
          style={{
            marginLeft: 8,
            border: 0,
            background: "transparent",
            fontSize: fontSize - 2,
            fontWeight: 600,
            color: "var(--mk-blue)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Edit
        </button>
      )}
    </div>
  )
}
