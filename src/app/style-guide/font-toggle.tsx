"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type FontOption = "default" | "questrial" | "google-sans"

const OPTIONS: { value: FontOption; label: string; className?: string }[] = [
  { value: "default", label: "Theme default" },
  { value: "questrial", label: "Questrial", className: "font-preview-questrial" },
  {
    value: "google-sans",
    label: "“Google Sans” (Inter)",
    className: "font-preview-google-sans",
  },
]

export function FontToggle({
  children,
}: {
  // Render-prop rather than plain children: each theme direction's own
  // wrapper div (.theme-clinical etc.) redefines --font-sans/--font-heading
  // itself, so the font-preview class has to land on that *same* element
  // (not an ancestor) to win the cascade — callers apply the class name
  // this hands back alongside their own theme class.
  children: (fontClassName: string | undefined) => React.ReactNode
}) {
  const [font, setFont] = React.useState<FontOption>("default")
  const active = OPTIONS.find((o) => o.value === font)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Preview font:
          </span>
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setFont(o.value)}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs",
                font === o.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        {font === "google-sans" && (
          <p className="text-xs text-muted-foreground">
            &quot;Google Sans&quot; isn&apos;t published on Google Fonts —
            it&apos;s Google&apos;s in-house proprietary face, not available
            for web embedding. Inter is the closest openly-licensed
            stand-in for this preview, not the real thing.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Preview only, scoped to this page — doesn&apos;t change the live
          app&apos;s typography.
        </p>
      </div>
      {children(active?.className)}
    </div>
  )
}
