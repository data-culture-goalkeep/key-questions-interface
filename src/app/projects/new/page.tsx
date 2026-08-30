import { redirect } from "next/navigation"

import { getCurrentUserContext } from "@/lib/auth"

import { NewProjectForm } from "./new-project-form"

export default async function NewProjectPage() {
  const userContext = await getCurrentUserContext()
  if (userContext?.role !== "facilitator") {
    redirect("/")
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">New project</h1>
        <p className="text-sm text-muted-foreground">
          Starts with the standard 5 indicator levels — adjust them anytime
          from the project&apos;s Configure page.
        </p>
      </div>
      <NewProjectForm />
    </main>
  )
}
