import Link from "next/link"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUserContext } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const userContext = await getCurrentUserContext()
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, slug, name, client_name, status")
    .order("name")

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Key Questions Navigator</h1>
          {userContext && (
            <p className="text-sm text-muted-foreground">
              Signed in as {userContext.email}{" "}
              <Badge variant="outline" className="ml-1 align-middle">
                {userContext.role}
              </Badge>
            </p>
          )}
        </div>
        <form action="/sign-out" method="post">
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {userContext?.role === "facilitator"
              ? "All projects"
              : "Your project"}
          </h2>
          {userContext?.role === "facilitator" && (
            <Link href="/projects/new">
              <Button type="button" variant="outline" size="sm">
                New project
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Couldn&apos;t load projects: {error.message}
          </p>
        )}

        {!error && projects?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {userContext?.role === "facilitator"
              ? "No projects yet."
              : "You don't have access to any project yet — ask your facilitator to invite you."}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {projects?.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{p.name}</span>
                    <Badge variant={p.status === "active" ? "secondary" : "outline"}>
                      {p.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {p.client_name}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <Link href="/style-guide" className="underline">
          View style guide
        </Link>
      </p>
    </main>
  )
}
