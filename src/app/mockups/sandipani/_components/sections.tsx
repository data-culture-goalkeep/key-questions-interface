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
            // Superset-style panel header: title (and any helper note) sit
            // above a full-width rule, not to the left of it.
            <div
              style={{
                marginBottom: 12,
                paddingBottom: 7,
                borderBottom: "1px solid var(--mk-border)",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--mk-ink)",
                }}
              >
                {s.title}
              </h2>
              {s.note && (
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--mk-sec)",
                    textAlign: "right",
                    flex: "none",
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
            {s.cards.map((c, ci) => (
              <ElementCard
                key={c.num === "—" ? `_note${ci}` : c.num}
                card={c}
                viewId={viewId}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
