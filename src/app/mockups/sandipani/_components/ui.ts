import type { CSSProperties } from "react"

import { avatarColor, initial } from "@/lib/mockup/content/reviewers"

export { avatarColor, initial }

/** Relative time, matching the reference ("today" / "1d" / "12d"). */
export function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return "today"
  if (days === 1) return "1d"
  return days + "d"
}

export function avatarStyle(name: string, size: number): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: "50%",
    background: avatarColor(name),
    color: "var(--mk-ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: Math.round(size * 0.46),
    fontWeight: 700,
    flex: "none",
  }
}

export const CARD: CSSProperties = {
  background: "var(--mk-surface)",
  border: "1px solid var(--mk-border)",
  borderRadius: 11,
}
