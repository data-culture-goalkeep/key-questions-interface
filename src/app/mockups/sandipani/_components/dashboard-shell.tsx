"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { scenarioById } from "@/lib/mockup/content/scenarios"
import { VIEWS, viewById } from "@/lib/mockup/content/views"

import {
  MockupGate,
  countReviewed,
  useMockup,
} from "../mockup-provider"
import { FilterBar } from "./filter-bar"
import { ReviewRail } from "./review-rail"
import { avatarStyle, initial } from "./ui"

const BASE = "/mockups/sandipani"

/** Derive the active view id from the pathname. */
function useActiveViewId(): string {
  const pathname = usePathname()
  if (pathname.startsWith(`${BASE}/v/`)) {
    return pathname.slice(`${BASE}/v/`.length).split("/")[0]
  }
  if (pathname.startsWith(`${BASE}/guide`)) return "guide"
  if (pathname.startsWith(`${BASE}/coverage`)) return "coverage"
  if (pathname.startsWith(`${BASE}/log`)) return "log"
  if (pathname.startsWith(`${BASE}/matrix`)) return "matrix"
  return "guide"
}

function hrefForView(id: string): string {
  if (id === "guide") return `${BASE}/guide`
  if (id === "coverage") return `${BASE}/coverage`
  if (id === "log") return `${BASE}/log`
  if (id === "matrix") return `${BASE}/matrix`
  return `${BASE}/v/${id}`
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const viewId = useActiveViewId()
  const view = viewById(viewId)
  const { railOpen, toggleRail } = useMockup()

  return (
    <div style={{ minHeight: "100vh", background: "var(--mk-canvas)" }}>
      <Header viewId={viewId} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `minmax(0,1fr) ${railOpen ? "320px" : "44px"}`,
          alignItems: "start",
        }}
      >
        <div style={{ padding: "15px 17px 40px", minWidth: 0 }}>
          {view && <ViewChrome viewId={viewId} />}
          <MockupGate>{() => <>{children}</>}</MockupGate>
        </div>

        {railOpen ? (
          <ReviewRail viewId={viewId} />
        ) : (
          <CollapsedRail onExpand={toggleRail} />
        )}
      </div>
    </div>
  )
}

function CollapsedRail({ onExpand }: { onExpand: () => void }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 81,
        height: "calc(100vh - 81px)",
        borderLeft: "1px solid var(--mk-border)",
        background: "var(--mk-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 14,
        gap: 12,
      }}
    >
      <button
        type="button"
        onClick={onExpand}
        aria-label="Expand review rail"
        title="Expand review rail"
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          border: "1px solid var(--mk-border)",
          background: "#fff",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          color: "var(--mk-sec)",
        }}
      >
        «
      </button>
      <span
        style={{
          writingMode: "vertical-rl",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--mk-sec)",
        }}
      >
        Review
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------

function Header({ viewId }: { viewId: string }) {
  const router = useRouter()
  const { data, reviewerId, reviewerName } = useMockup()
  const done = data ? countReviewed(data, reviewerId) : 0

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "var(--mk-surface)",
        borderBottom: "1px solid var(--mk-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 46,
          padding: "0 18px",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            background: "var(--mk-blue)",
            flex: "none",
          }}
        />
        <span
          style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
        >
          Sandipani Vidyalaya · scale-management dashboard
        </span>
        <span
          className="mk-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            padding: "3px 7px",
            borderRadius: 4,
            background: "var(--mk-border-soft)",
            color: "var(--mk-sec)",
            fontWeight: 600,
            flex: "none",
          }}
        >
          Mockup
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{ fontSize: 12, color: "var(--mk-sec)", whiteSpace: "nowrap" }}
        >
          Reviewed{" "}
          <strong style={{ color: "var(--mk-ink)" }}>{done}</strong> of 105
          elements
        </span>
        <button
          type="button"
          onClick={() => router.push("/mockups")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "4px 5px 4px 10px",
            borderRadius: 20,
            border: 0,
            background: "var(--mk-border-soft)",
            cursor: "pointer",
            flex: "none",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>
            {reviewerName}
          </span>
          <span style={avatarStyle(reviewerName, 22)}>
            {initial(reviewerName)}
          </span>
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          padding: "0 18px",
          overflowX: "auto",
        }}
      >
        {VIEWS.filter((t) => !t.ref).map((t) => {
          const active = t.id === viewId
          return (
            <Link
              key={t.id}
              href={hrefForView(t.id)}
              style={{
                padding: "0 12px",
                height: 34,
                display: "flex",
                alignItems: "center",
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--mk-blue)" : "var(--mk-sec)",
                borderBottom: `2px solid ${active ? "var(--mk-blue)" : "transparent"}`,
                whiteSpace: "nowrap",
                ...(t.ref
                  ? {
                      borderLeft: "1px solid var(--mk-border)",
                      marginLeft: 8,
                    }
                  : {}),
              }}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function ViewChrome({ viewId }: { viewId: string }) {
  const mk = useMockup()
  const view = viewById(viewId)
  if (!view) return null
  const scenario = scenarioById(mk.scenarioFor(viewId))
  const isRef = view.kind === "ref"

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          background: "var(--mk-surface)",
          border: "1px solid var(--mk-border)",
          borderRadius: 10,
          marginBottom: 13,
        }}
      >
        <span
          className="mk-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: ".07em",
            textTransform: "uppercase",
            padding: "3px 7px",
            borderRadius: 4,
            background: isRef ? "var(--mk-border-soft)" : "var(--mk-blue)",
            color: isRef ? "var(--mk-sec)" : "#fff",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {isRef ? "Reference material" : "Dashboard view"}
        </span>
        {view.filters && <FilterBar viewId={viewId} />}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: "0 0 5px",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-.02em",
            }}
          >
            {view.title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--mk-sec)",
              maxWidth: "88ch",
            }}
          >
            {view.purpose}
          </p>
        </div>
        <div style={{ flex: 1 }} />
        {view.kqs.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              justifyContent: "flex-end",
              maxWidth: 230,
            }}
          >
            {view.kqs.map((k) => (
              <span
                key={k}
                className="mk-mono"
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  padding: "3px 6px",
                  borderRadius: 4,
                  background: "var(--mk-blue-tint)",
                  color: "var(--mk-blue)",
                }}
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </div>

      {scenario.banner && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            padding: "11px 13px",
            borderRadius: 9,
            background: "var(--mk-scenario-bg)",
            border: "1px solid var(--mk-scenario-border)",
            marginBottom: 15,
          }}
        >
          <span
            className="mk-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              padding: "3px 6px",
              borderRadius: 4,
              background: "var(--mk-yellow)",
              color: "var(--mk-ink)",
              fontWeight: 700,
              flex: "none",
            }}
          >
            Scenario
          </span>
          <span
            style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--mk-ink)" }}
          >
            {scenario.banner}
          </span>
        </div>
      )}
    </>
  )
}
