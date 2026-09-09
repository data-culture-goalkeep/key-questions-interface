"use client"

import type { MockupCard } from "@/lib/mockup/build-view"
import { isReviewed } from "@/lib/mockup/types"

import {
  answerFor,
  elementThread,
  useMockup,
} from "../mockup-provider"
import { CardBody } from "./card-body"

export function ElementCard({
  card,
  viewId,
}: {
  card: MockupCard
  viewId: string
}) {
  const { data, reviewerId, focus, setFocus } = useMockup()
  const isNote = card.num === "—"
  const focused = focus === card.num

  const thread =
    data && !isNote ? elementThread(data, viewId, card.num) : []
  const answered =
    data && !isNote
      ? isReviewed(answerFor(data, reviewerId, viewId, card.num))
      : false

  return (
    <div
      role={isNote ? undefined : "button"}
      tabIndex={isNote ? undefined : 0}
      onClick={isNote ? undefined : () => setFocus(card.num)}
      onKeyDown={
        isNote
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setFocus(card.num)
              }
            }
      }
      style={{
        background: "var(--mk-surface)",
        border: focused
          ? "2px solid var(--mk-blue)"
          : "1px solid var(--mk-border)",
        borderRadius: 11,
        padding: focused ? "12px 13px" : "13px 14px",
        cursor: isNote ? "default" : "pointer",
        minWidth: 0,
        boxShadow: focused ? "0 0 0 3px rgba(23,71,158,.1)" : undefined,
        gridColumn: card.full ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <span
          className="mk-mono"
          style={{
            fontSize: 10,
            fontWeight: focused ? 700 : 600,
            color: focused ? "var(--mk-blue)" : "var(--mk-sec)",
            flex: "none",
          }}
        >
          {card.num}
        </span>
        {card.type !== "scorecard" && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--mk-ink)",
              lineHeight: 1.3,
              minWidth: 0,
            }}
          >
            {card.name}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {card.kq && (
          <span
            className="mk-mono"
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: "2px 5px",
              borderRadius: 3,
              background: "var(--mk-blue-tint)",
              color: "var(--mk-blue)",
              whiteSpace: "nowrap",
            }}
          >
            {card.kq}
          </span>
        )}
        {thread.length > 0 && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              fontWeight: 700,
              color: "var(--mk-bad-fg)",
              whiteSpace: "nowrap",
            }}
          >
            ● {thread.length}
          </span>
        )}
        {answered && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--mk-good-fg)",
            }}
          >
            ✓
          </span>
        )}
      </div>
      <CardBody card={card} />
    </div>
  )
}
