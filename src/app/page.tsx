import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Key Questions Navigator</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Phase 0 scaffold. The app screens aren&apos;t built yet — start with
        the style guide to pick a visual direction.
      </p>
      <Button asChild>
        <Link href="/style-guide">View style guide</Link>
      </Button>
    </main>
  )
}
