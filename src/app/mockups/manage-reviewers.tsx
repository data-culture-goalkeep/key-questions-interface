"use client"

import * as React from "react"

import { addReviewer, deleteReviewer } from "@/lib/mockup/actions"
import { getMockupData } from "@/lib/mockup/mockup-data"
import { AVATAR_COLORS, initial } from "@/lib/mockup/content/reviewers"
import type { MockupData } from "@/lib/mockup/types"

interface Row {
  id: string
  name: string
  comments: number
  answers: number
}

function toRows(data: MockupData): Row[] {
  return [...data.reviewers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => ({
      id: r.id,
      name: r.name,
      comments: data.comments.filter((c) => c.reviewerId === r.id).length,
      answers: data.answers.filter((a) => a.reviewerId === r.id).length,
    }))
}

export function ManageReviewers({ onChange }: { onChange?: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [rows, setRows] = React.useState<Row[] | null>(null)
  const [newName, setNewName] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    try {
      setRows(toRows(await getMockupData()))
      setError(null)
    } catch {
      setError("Couldn't load reviewers.")
    }
  }, [])

  const refreshAll = React.useCallback(async () => {
    await load()
    onChange?.()
  }, [load, onChange])

  function toggle() {
    if (!open && !rows) void load()
    setOpen((o) => !o)
  }

  async function add() {
    const name = newName.trim()
    if (!name || busy) return
    setBusy(true)
    try {
      await addReviewer(name)
      setNewName("")
      await refreshAll()
    } catch {
      setError(`Couldn't add "${name}".`)
    } finally {
      setBusy(false)
    }
  }

  async function remove(row: Row) {
    const hasWork = row.comments > 0 || row.answers > 0
    const warning = hasWork
      ? `${row.name} has ${row.comments} comment${row.comments === 1 ? "" : "s"} and ${row.answers} saved answer${row.answers === 1 ? "" : "s"}. Deleting the reviewer will permanently delete all of it. Continue?`
      : `Delete reviewer "${row.name}"?`
    if (!window.confirm(warning)) return
    setBusy(true)
    try {
      await deleteReviewer(row.id)
      await refreshAll()
    } catch {
      setError(`Couldn't delete "${row.name}".`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        background: "var(--mk-surface)",
        border: "1px solid var(--mk-border)",
        borderRadius: 12,
        padding: "18px 22px",
        marginTop: 16,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        style={{
          border: 0,
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--mk-ink)",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--mk-sec)" }}>
          {open ? "▾" : "▸"}
        </span>
        Manage reviewers
      </button>

      {open && (
        <div style={{ marginTop: 14 }}>
          {error && (
            <div
              style={{
                fontSize: 12,
                color: "var(--mk-bad-fg)",
                marginBottom: 10,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void add()
              }}
              placeholder="Add a reviewer by name…"
              style={{
                flex: 1,
                maxWidth: 280,
                padding: "7px 11px",
                border: "1px solid var(--mk-border)",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={add}
              disabled={!newName.trim() || busy}
              style={{
                padding: "7px 15px",
                borderRadius: 8,
                border: 0,
                background: newName.trim() && !busy ? "var(--mk-ink)" : "#d8d6d6",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: newName.trim() && !busy ? "pointer" : "default",
              }}
            >
              Add
            </button>
          </div>

          {!rows ? (
            <div style={{ fontSize: 12.5, color: "var(--mk-sec)" }}>Loading…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 4px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: AVATAR_COLORS[r.name.length % 4],
                      color: "var(--mk-ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      flex: "none",
                    }}
                  >
                    {initial(r.name)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 11.5, color: "var(--mk-sec)" }}>
                    {r.comments} comment{r.comments === 1 ? "" : "s"} ·{" "}
                    {r.answers} answer{r.answers === 1 ? "" : "s"}
                  </span>
                  <div style={{ flex: 1 }} />
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    disabled={busy}
                    style={{
                      border: "1px solid var(--mk-border)",
                      background: "#fff",
                      borderRadius: 7,
                      padding: "3px 10px",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "var(--mk-bad-fg)",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
