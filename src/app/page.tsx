import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Public app-chooser. No auth, no Supabase — this is shared Goalkeep chrome
// that sits in front of both apps. KQ Navigator (auth-gated) lives at
// /projects; Mockup Navigator (no auth) lives at /mockups.
export const metadata = {
  title: "Goalkeep — choose an app",
}

const APPS = [
  // KQ Navigator is temporarily hidden so it doesn't distract reviewers
  // during the Mockup Navigator review sessions — see GitHub issue #32.
  {
    href: "/projects",
    name: "KQ Navigator",
    description:
      "Review, refine, map, and prioritise a project's Key Questions. Sign-in required.",
    hidden: true,
  },
  {
    href: "/mockups",
    name: "Mockup Navigator",
    description:
      "Walk through dashboard mockups and capture review feedback. No sign-in needed.",
    hidden: false,
  },
] as const

export default function AppChooserPage() {
  const apps = APPS.filter((a) => !a.hidden)
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/goalkeep-logo.png"
          alt="Goalkeep"
          width={140}
          height={32}
          className="h-8 w-auto"
          priority
        />
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">
          Which app do you want to open?
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {apps.map((app) => (
          <Link key={app.href} href={app.href} className="group">
            <Card className="h-full transition-colors group-hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{app.name}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {app.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
