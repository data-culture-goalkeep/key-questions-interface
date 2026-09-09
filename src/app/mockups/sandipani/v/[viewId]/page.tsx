import { notFound } from "next/navigation"

import { DASHBOARD_VIEWS } from "@/lib/mockup/content/views"

import { DashboardView } from "../../_components/dashboard-view"

export function generateStaticParams() {
  return DASHBOARD_VIEWS.map((v) => ({ viewId: v.id }))
}

export default async function MockupViewPage({
  params,
}: {
  params: Promise<{ viewId: string }>
}) {
  const { viewId } = await params
  if (!DASHBOARD_VIEWS.some((v) => v.id === viewId)) notFound()
  return <DashboardView viewId={viewId} />
}
