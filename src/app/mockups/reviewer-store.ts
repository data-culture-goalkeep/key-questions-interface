"use client"

import * as React from "react"

const KEY = "sandipani-review-reviewer"

// A tiny external store so components can read the chosen reviewer name
// (localStorage — no auth in this app) without a setState-in-effect or a
// hydration mismatch. getServerSnapshot returns null, so the server renders
// the "no reviewer" branch and the client corrects on hydration.

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** The chosen reviewer name; null on the server and until one is picked. */
export function useReviewerName() {
  const name = React.useSyncExternalStore(subscribe, getSnapshot, () => null)

  const choose = React.useCallback((next: string) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // ignore blocked storage
    }
    emit()
  }, [])

  return { name, choose }
}

export function readReviewerName(): string | null {
  return getSnapshot()
}
