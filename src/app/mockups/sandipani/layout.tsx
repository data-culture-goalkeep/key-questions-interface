"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useHydrated, useReviewerName } from "../reviewer-store"
import { DashboardShell } from "./_components/dashboard-shell"
import { MockupProvider } from "./mockup-provider"

// Trivial wrapper: it exists so MockupProvider is mounted at the layout level
// and survives client-side navigation between the dashboard views and
// reference pages — switching tabs makes zero network calls (all data comes
// from the one getMockupData() fetch the provider runs on mount).
export default function SandipaniLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const hydrated = useHydrated()
  const { name } = useReviewerName()

  React.useEffect(() => {
    if (hydrated && !name) router.replace("/mockups")
  }, [hydrated, name, router])

  if (!hydrated || !name) {
    return (
      <div style={{ padding: "44px 24px", fontSize: 13, color: "var(--mk-sec)" }}>
        Loading…
      </div>
    )
  }

  return (
    <MockupProvider reviewerName={name}>
      <DashboardShell>{children}</DashboardShell>
    </MockupProvider>
  )
}
