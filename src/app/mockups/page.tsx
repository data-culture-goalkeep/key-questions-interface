"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ensureReviewer } from "@/lib/mockup/actions"
import { getMockupData } from "@/lib/mockup/mockup-data"
import {
  AVATAR_COLORS,
  PRESET_REVIEWERS,
  initial,
} from "@/lib/mockup/content/reviewers"

import { ManageReviewers } from "./manage-reviewers"
import { useReviewerName } from "./reviewer-store"

const FIRST_VIEW = "/mockups/sandipani/v/v1"

export default function MockupBriefPage() {
  const router = useRouter()
  const { name, choose } = useReviewerName()
  const [selected, setSelected] = React.useState<string | null>(null)
  const [custom, setCustom] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [dbNames, setDbNames] = React.useState<string[] | null>(null)

  const reloadNames = React.useCallback(() => {
    getMockupData().then(
      (data) =>
        setDbNames(
          [...data.reviewers.map((r) => r.name)].sort((a, b) =>
            a.localeCompare(b),
          ),
        ),
      () => setDbNames((prev) => prev),
    )
  }, [])

  React.useEffect(() => {
    let ignore = false
    getMockupData().then(
      (data) => {
        if (ignore) return
        setDbNames(
          [...data.reviewers.map((r) => r.name)].sort((a, b) =>
            a.localeCompare(b),
          ),
        )
      },
      () => {},
    )
    return () => {
      ignore = true
    }
  }, [])

  const names = dbNames ?? [...PRESET_REVIEWERS].sort((a, b) => a.localeCompare(b))
  const active = (custom.trim() || selected || name || "").trim()

  async function start() {
    if (!active || busy) return
    setBusy(true)
    try {
      await ensureReviewer(active)
      choose(active)
      router.push(FIRST_VIEW)
    } catch {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "44px 24px 60px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            marginBottom: 26,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "var(--mk-blue)",
            }}
          />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>
            Peepul India · Sandipani Vidyalaya
          </span>
          <span
            className="mk-mono"
            style={{
              fontSize: 10,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 4,
              background: "var(--mk-yellow)",
              color: "var(--mk-ink)",
              fontWeight: 700,
            }}
          >
            Mockup for review
          </span>
        </div>

        <div
          style={{
            background: "var(--mk-surface)",
            border: "1px solid var(--mk-border)",
            borderRadius: 12,
            padding: "32px 34px 30px",
            marginBottom: 16,
          }}
        >
          <div
            className="mk-mono"
            style={{
              fontSize: 10,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--mk-sec)",
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            Reference material · review brief
          </div>
          <h1
            style={{
              margin: "0 0 16px",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-.025em",
              lineHeight: 1.15,
              maxWidth: "24ch",
            }}
          >
            Review the programme dashboard before we build it
          </h1>
          <p
            style={{
              margin: "0 0 22px",
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: "76ch",
            }}
          >
            This is a clickable simulation of the Superset dashboard we will
            build for the Sandipani Vidyalaya programme. Every number is dummy
            data. What we need from you is not a verdict on the design — it is
            whether each chart <strong>answers its key question</strong> and{" "}
            <strong>enables the action</strong> attached to it.
          </p>
          <div
            style={{
              padding: "17px 19px",
              borderRadius: 10,
              background: "var(--mk-canvas)",
              borderLeft: "3px solid var(--mk-blue)",
              marginBottom: 26,
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
              Dashboard purpose
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
              Sandipani&apos;s primary programme-level, scale-management view for
              programme leadership, District Leads and capacity-building teams.
              It brings together programme inputs, academic governance, priority
              academic processes, teaching practice, student learning outcomes
              and early warning signs — to identify what is and is not working
              across districts and schools, guide support and course correction,
              and reduce decision fatigue.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 14,
            }}
          >
            {[
              [
                "Move through the eight views",
                "Use the tab strip. Filters carry across views. Each view opens with a one-line note on the decision it serves.",
              ],
              [
                "Click any chart to review it",
                "The right-hand rail shows that element's key question and the action it should enable. Answer two questions, add a comment.",
              ],
              [
                "Try the scenario switcher",
                "Each view can show the programme as-is, a results chain that holds, and one that breaks — so you can judge whether failure would actually be visible.",
              ],
            ].map(([title, body], i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--mk-blue)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: "var(--mk-sec)",
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "var(--mk-surface)",
            border: "1px solid var(--mk-border)",
            borderRadius: 12,
            padding: "26px 28px 28px",
          }}
        >
          <h2
            style={{
              margin: "0 0 5px",
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "-.01em",
            }}
          >
            Who&apos;s reviewing?
          </h2>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: 13,
              color: "var(--mk-sec)",
            }}
          >
            Pick your name, or type it in. Your comments are attributed to you.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {names.map((m) => {
              const on = !custom.trim() && active === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSelected(m)
                    setCustom("")
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 12px 7px 8px",
                    border: `1.5px solid ${on ? "var(--mk-blue)" : "var(--mk-border)"}`,
                    borderRadius: 22,
                    background: on ? "var(--mk-blue-tint)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: AVATAR_COLORS[m.length % 4],
                      color: "var(--mk-ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {initial(m)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{m}</span>
                </button>
              )
            })}
          </div>

          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onFocus={() => setSelected(null)}
            placeholder="or type your name…"
            style={{
              marginTop: 14,
              width: "100%",
              maxWidth: 280,
              padding: "8px 11px",
              border: `1px solid ${custom.trim() ? "var(--mk-blue)" : "var(--mk-border)"}`,
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              background: custom.trim() ? "var(--mk-blue-tint)" : "#fff",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 20,
              paddingTop: 19,
              borderTop: "1px solid var(--mk-border-soft)",
            }}
          >
            <button
              type="button"
              onClick={start}
              disabled={!active || busy}
              style={{
                padding: "9px 19px",
                borderRadius: 8,
                border: 0,
                background: active && !busy ? "var(--mk-ink)" : "#d8d6d6",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: active && !busy ? "pointer" : "default",
              }}
            >
              {busy
                ? "Starting…"
                : active
                  ? `Start reviewing as ${active}`
                  : "Pick your name"}
            </button>
            <span style={{ fontSize: 12, color: "var(--mk-sec)" }}>
              You can switch reviewer any time from the header.
            </span>
          </div>
        </div>

        <ManageReviewers onChange={reloadNames} />
      </div>
    </div>
  )
}
