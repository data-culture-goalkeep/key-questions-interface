"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KqCard } from "@/components/kq-card"
import {
  DUMMY_KEY_QUESTIONS,
  INDICATOR_LEVELS,
  type Priority,
} from "@/lib/dummy-data"

import { FontToggle } from "./font-toggle"

const SWATCHES: { token: string; label: string }[] = [
  { token: "background", label: "Background" },
  { token: "foreground", label: "Foreground" },
  { token: "primary", label: "Primary" },
  { token: "secondary", label: "Secondary" },
  { token: "muted", label: "Muted" },
  { token: "accent", label: "Accent" },
  { token: "destructive", label: "Destructive" },
  { token: "border", label: "Border" },
]

const priorities: Priority[] = ["high", "medium", "low"]

function ColorSwatches() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SWATCHES.map((s) => (
        <div key={s.token} className="flex flex-col gap-1.5">
          <div
            className="h-14 rounded-lg ring-1 ring-border"
            style={{ backgroundColor: `var(--${s.token})` }}
          />
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

function IndicatorSwatches() {
  return (
    <div className="flex flex-wrap gap-3">
      {INDICATOR_LEVELS.map((l) => (
        <div key={l.value} className="flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: `var(--chart-${l.chart})` }}
          />
          <span className="text-sm">{l.label}</span>
        </div>
      ))}
    </div>
  )
}

function Typography() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-3xl font-semibold">
        Key Questions Navigator
      </h1>
      <h2 className="font-heading text-xl font-medium">
        Section heading — Are We Delivering As Planned?
      </h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Body text: reviewing this document in its current flat spreadsheet
        form is difficult for clients because of the sheer density of
        information per row, and there is no structured way to capture
        client feedback, track refinement of definitions, or run a
        prioritisation exercise collaboratively.
      </p>
      <p className="text-xs text-muted-foreground">
        Caption / metadata text — KQ07 · Input · Updated 2026-08-22
      </p>
    </div>
  )
}

function ButtonsAndForm() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {priorities.map((p) => (
          <Badge
            key={p}
            variant={
              p === "high" ? "destructive" : p === "medium" ? "secondary" : "outline"
            }
          >
            {p} priority
          </Badge>
        ))}
      </div>
      <div className="grid max-w-sm gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="demo-input">Area of enquiry</Label>
          <Input id="demo-input" placeholder="Who Are We Reaching?" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="demo-textarea">Suggested edit</Label>
          <Textarea
            id="demo-textarea"
            placeholder="Suggest a tighter definition for this indicator..."
          />
        </div>
      </div>
    </div>
  )
}

function ThemeShowcase() {
  const collapsedExample = DUMMY_KEY_QUESTIONS[1]
  const expandedExample = DUMMY_KEY_QUESTIONS[6]

  return (
    <div className="flex flex-col gap-10 rounded-2xl border border-border bg-background p-6 text-foreground sm:p-8">
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Colour
        </h3>
        <ColorSwatches />
        <IndicatorSwatches />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Typography
        </h3>
        <Typography />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Buttons, badges &amp; form controls
        </h3>
        <ButtonsAndForm />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Key question card — collapsed
        </h3>
        <KqCard kq={collapsedExample} />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Key question card — expanded, with comments
        </h3>
        <KqCard kq={expandedExample} defaultOpen role="client" />
      </section>
    </div>
  )
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-1.5">
        <Link href="/" className="text-xs text-muted-foreground underline">
          ← Back to app
        </Link>
        <h1 className="text-2xl font-semibold">Style Guide — 3 Directions</h1>
        <p className="text-sm text-muted-foreground">
          Same components and dummy content, three visual directions. Pick
          one (or mix) before real screens get built. The live app currently
          ships the Bold &amp; Structured direction.
        </p>
      </div>

      <FontToggle>
        {(fontClassName) => (
          <Tabs defaultValue="clinical">
            <TabsList>
              <TabsTrigger value="clinical">Clean &amp; Clinical</TabsTrigger>
              <TabsTrigger value="warm">Warm &amp; Approachable</TabsTrigger>
              <TabsTrigger value="bold">Bold &amp; Structured</TabsTrigger>
            </TabsList>
            <TabsContent value="clinical">
              <div className={cn("theme-clinical", fontClassName)}>
                <ThemeShowcase />
              </div>
            </TabsContent>
            <TabsContent value="warm">
              <div className={cn("theme-warm", fontClassName)}>
                <ThemeShowcase />
              </div>
            </TabsContent>
            <TabsContent value="bold">
              <div className={cn("theme-bold", fontClassName)}>
                <ThemeShowcase />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </FontToggle>
    </main>
  )
}
