"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { createProject } from "./actions"

export function NewProjectForm() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [clientName, setClientName] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !clientName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const { slug } = await createProject(name.trim(), clientName.trim())
      router.push(`/projects/${slug}/configure`)
    } catch {
      setError("Couldn't create the project — try again.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sandipani Vidyalayas"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clientName">Client name</Label>
        <Input
          id="clientName"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Peepul"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={saving || !name.trim() || !clientName.trim()}>
        {saving ? "Creating…" : "Create project"}
      </Button>
    </form>
  )
}
