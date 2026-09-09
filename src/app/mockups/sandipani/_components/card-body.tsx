"use client"

import { LEVELS, LEVEL_RAMP } from "@/lib/mockup/content/palette"
import {
  formatTableRows,
  type BarsCard,
  type MockupCard,
  type ScorecardCard,
  type StackCard,
  type TableCard,
} from "@/lib/mockup/build-view"

// A table's scroll area is sized for a fixed number of rows so filtering
// (which can drop a 10-row table to 1 row) never changes the card's size.
// Small always-fixed tables (e.g. Female/Male) stay compact; big ones scroll.
const TABLE_HEADER_H = 30
const TABLE_ROW_H = 30
const TABLE_MAX_ROWS = 9

function tableScrollHeight(card: TableCard): number {
  const rows = Math.min(card.rowsReserve ?? card.rows.length, TABLE_MAX_ROWS)
  return TABLE_HEADER_H + Math.max(rows, 1) * TABLE_ROW_H
}

export function CardBody({ card }: { card: MockupCard }) {
  switch (card.type) {
    case "scorecard":
      return <Scorecard card={card} />
    case "table":
      return <DataTable card={card} />
    case "bars":
      return <BarChart card={card} />
    case "stack":
      return <StackChart card={card} />
    case "note":
      return (
        <div
          style={{
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--mk-sec)",
          }}
        >
          {card.body}
        </div>
      )
  }
}

function Scorecard({ card }: { card: ScorecardCard }) {
  const len = card.value.length
  const size = len > 6 ? 23 : len > 4 ? 26 : 29
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.35,
          color: "var(--mk-sec)",
          marginBottom: 6,
        }}
      >
        {card.name}
      </div>
      <div
        style={{
          fontSize: size,
          fontWeight: 700,
          letterSpacing: "-.025em",
          lineHeight: 1,
          color: card.reverse ? "var(--mk-bad-fg)" : "var(--mk-ink)",
          whiteSpace: "nowrap",
        }}
      >
        {card.value}
      </div>
      {card.splits && (
        <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
          {card.splits.map((sp) => (
            <div
              key={sp.label}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 7,
                background: "var(--mk-canvas)",
                minWidth: 0,
              }}
            >
              <div
                style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}
              >
                {sp.value}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--mk-sec)" }}>
                {sp.label}
              </div>
            </div>
          ))}
        </div>
      )}
      {card.sub && (
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.45,
            color: "var(--mk-sec)",
            marginTop: 7,
          }}
        >
          {card.sub}
        </div>
      )}
    </div>
  )
}

function DataTable({ card }: { card: TableCard }) {
  const rows = formatTableRows(card.head, card.rows)
  const toneBg = (t: string) =>
    t === "good"
      ? "var(--mk-good-bg)"
      : t === "bad"
        ? "var(--mk-bad-bg)"
        : "transparent"
  const toneFg = (t: string) =>
    t === "good"
      ? "var(--mk-good-fg)"
      : t === "bad"
        ? "var(--mk-bad-fg)"
        : "var(--mk-ink)"
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Fixed height so the card never reflows when a filter changes the
          number of visible rows — it scrolls internally instead. */}
      <div
        style={{
          overflow: "auto",
          height: tableScrollHeight(card),
          margin: "0 -2px",
          borderBottom: "1px solid var(--mk-border-hair)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
            minWidth: card.minWidth,
          }}
        >
          <thead>
            <tr>
              {card.head.map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: i === 0 ? "left" : "right",
                    padding: "6px 8px 8px",
                    fontSize: 9.5,
                    fontWeight: 600,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    color: "var(--mk-sec)",
                    borderBottom: "1px solid var(--mk-border)",
                    whiteSpace: "nowrap",
                    position: "sticky",
                    top: 0,
                    background: "var(--mk-surface)",
                    zIndex: 1,
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cell.numeric ? "mk-mono" : undefined}
                    style={{
                      padding: "7px 8px",
                      borderBottom: "1px solid var(--mk-border-hair)",
                      textAlign: cell.numeric ? "right" : "left",
                      fontWeight: cell.emphasis ? 600 : ci === 0 ? 500 : 400,
                      color: toneFg(cell.tone),
                      background: toneBg(cell.tone),
                      fontSize: ci === 0 ? 12 : 11.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cell.display}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {card.legend && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            paddingTop: 9,
            borderTop: "1px solid var(--mk-border-hair)",
          }}
        >
          <span style={{ fontSize: 10.5, color: "var(--mk-sec)" }}>
            {card.legend}
          </span>
          <span
            style={{
              padding: "2px 7px",
              borderRadius: 4,
              background: "var(--mk-good-bg)",
              color: "var(--mk-good-fg)",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            ahead of peers
          </span>
          <span
            style={{
              padding: "2px 7px",
              borderRadius: 4,
              background: "var(--mk-bad-bg)",
              color: "var(--mk-bad-fg)",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            behind peers
          </span>
        </div>
      )}
    </div>
  )
}

function BarChart({ card }: { card: BarsCard }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {card.legend.map((l) => (
          <span
            key={l.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "var(--mk-sec)",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: l.color,
                flex: "none",
              }}
            />
            {l.label}
          </span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 14,
          height: 158,
          borderBottom: "1px solid var(--mk-border)",
        }}
      >
        {card.groups.map((g, gi) => (
          <div
            key={gi}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 4,
              height: "100%",
              minWidth: 0,
            }}
          >
            {g.bars.map((b, bi) => (
              <div
                key={bi}
                style={{
                  width: "100%",
                  maxWidth: 34,
                  height: `${Math.max(1, (b.value / card.max) * 100)}%`,
                  background: b.color,
                  borderRadius: "3px 3px 0 0",
                  position: "relative",
                }}
              >
                <span
                  className="mk-mono"
                  style={{
                    position: "absolute",
                    top: -15,
                    left: -4,
                    right: -4,
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--mk-ink)",
                  }}
                >
                  {card.percent ? `${b.value}%` : b.value.toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
        {card.groups.map((g, gi) => (
          <div
            key={gi}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              color: "var(--mk-sec)",
              lineHeight: 1.3,
              minWidth: 0,
            }}
          >
            {g.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function StackChart({ card }: { card: StackCard }) {
  return (
    // Top-aligned so a 2-row stack (e.g. by gender) lines its bars up with a
    // 3-row stack beside it (by subject / by grade).
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {LEVELS.map((l, i) => (
          <span
            key={l}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "var(--mk-sec)",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: LEVEL_RAMP[i],
                flex: "none",
              }}
            />
            {l}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {card.rows.map((r) => (
          <div key={r.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500 }}>{r.label}</span>
              {card.note && (
                <span
                  className="mk-mono"
                  style={{ fontSize: 10.5, color: "var(--mk-sec)" }}
                >
                  {card.note}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                height: 26,
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              {r.values.map((val, i) => (
                <div
                  key={i}
                  className="mk-mono"
                  style={{
                    width: `${val}%`,
                    background: LEVEL_RAMP[i],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: i === 3 ? "#fff" : "var(--mk-ink)",
                  }}
                >
                  {val >= 9 ? `${val}%` : ""}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
