"use client"

import Link from "next/link"

import { DASHBOARD_VIEWS, usersFor } from "@/lib/mockup/content/views"

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

export function GuideBody() {
  return (
    <>
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
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Dashboard views
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}
        >
          <thead>
            <tr>
              <th style={th}>View</th>
              <th style={{ ...th, padding: "9px 12px" }}>
                What it helps users do
              </th>
              <th style={th}>Primary users</th>
            </tr>
          </thead>
          <tbody>
            {DASHBOARD_VIEWS.map((v) => (
              <tr key={v.id}>
                <td
                  style={{
                    padding: "11px 17px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    verticalAlign: "top",
                  }}
                >
                  <Link href={`/mockups/sandipani/v/${v.id}`}>{v.label}</Link>
                </td>
                <td
                  style={{
                    padding: "11px 12px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                    lineHeight: 1.5,
                  }}
                >
                  {v.purpose}
                </td>
                <td
                  style={{
                    padding: "11px 17px",
                    borderBottom: "1px solid var(--mk-border-hair)",
                    color: "var(--mk-sec)",
                    lineHeight: 1.5,
                  }}
                >
                  {usersFor(v.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 13,
        }}
      >
        <InfoCard title="Using filters">
          <ol
            style={{
              margin: 0,
              paddingLeft: 19,
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "var(--mk-sec)",
            }}
          >
            <li>
              Start with Academic Year, then Division and District only when you
              need a geographic drill-down.
            </li>
            <li>
              &quot;All Divisions&quot; and &quot;All Districts&quot; show the
              programme-wide picture.
            </li>
            <li>
              Some views carry extra filters: Subject and Grade on the Learning
              views, Quarter on the PAP views, and Implementation Level on PAP
              Detail.
            </li>
            <li>
              Use tables to identify the schools, districts or activities needing
              follow-up.
            </li>
          </ol>
        </InfoCard>
        <InfoCard title="Reading the tables">
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "var(--mk-sec)",
            }}
          >
            Percentage columns are colour-coded against the peer average — green
            where a division or district is ahead, red where it is behind.
            Learning-level tables use a tighter threshold.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 5,
                background: "var(--mk-good-bg)",
                color: "var(--mk-good-fg)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              ≥5pp above peers
            </span>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 5,
                background: "var(--mk-bad-bg)",
                color: "var(--mk-bad-fg)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              ≥5pp below peers
            </span>
          </div>
        </InfoCard>
        <InfoCard title="What we need from you">
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "var(--mk-sec)",
            }}
          >
            Click any element to open its key question in the rail, then answer
            whether it answers that question and whether it enables the action.
            Everything you write is collected in the feedback log under
            Reference.
          </p>
        </InfoCard>
      </div>
    </>
  )
}

function InfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: "var(--mk-surface)",
        border: "1px solid var(--mk-border)",
        borderRadius: 11,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 9 }}>
        {title}
      </div>
      {children}
    </div>
  )
}
