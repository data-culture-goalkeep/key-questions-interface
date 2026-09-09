"use client"

import type { Section } from "@/lib/mockup/build-view"

import { ElementCard } from "./element-card"

export function Sections({
  sections,
  viewId,
}: {
  sections: Section[]
  viewId: string
}) {
  return (
    <>
      {sections.map((s, si) => (
        <div key={si} style={{ marginBottom: 20 }}>
          {s.title && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                marginBottom: 10,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: "var(--mk-sec)",
                  whiteSpace: "nowrap",
                }}
              >
                {s.title}
              </h2>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--mk-border)",
                }}
              />
              {s.note && (
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--mk-sec)",
                    textAlign: "right",
                  }}
                >
                  {s.note}
                </span>
              )}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: s.grid,
              gap: 11,
              // Cards sharing a row take a common height.
              alignItems: "stretch",
            }}
          >
            {s.cards.map((c) => (
              <ElementCard key={c.num} card={c} viewId={viewId} />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
