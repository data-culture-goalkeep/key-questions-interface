import * as React from "react"

// Wraps every case-insensitive occurrence of `query` in `text` with <mark>,
// preserving the original casing of the matched text. Returns `text`
// unchanged (as a plain string) when `query` is blank or doesn't match.
export function highlightMatch(text: string, query: string): React.ReactNode {
  const trimmed = query.trim()
  if (!trimmed) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = trimmed.toLowerCase()
  let matchIndex = lowerText.indexOf(lowerQuery)
  if (matchIndex === -1) return text

  const parts: React.ReactNode[] = []
  let cursor = 0
  while (matchIndex !== -1) {
    if (matchIndex > cursor) parts.push(text.slice(cursor, matchIndex))
    const end = matchIndex + trimmed.length
    parts.push(
      <mark key={matchIndex} className="rounded-sm bg-gk-yellow/60 text-inherit">
        {text.slice(matchIndex, end)}
      </mark>
    )
    cursor = end
    matchIndex = lowerText.indexOf(lowerQuery, cursor)
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts
}
