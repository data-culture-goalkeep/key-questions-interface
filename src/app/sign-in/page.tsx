import Image from "next/image"

import { SignInForm } from "./sign-in-form"

export default function SignInPage() {
  return (
    <main className="grid min-h-svh flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="hidden items-center justify-center bg-gk-ink px-10 py-16 lg:flex">
        <div className="flex flex-col items-center gap-10 text-center">
          <Image
            src="/goalkeep-logo-reverse.png"
            alt="Goalkeep"
            width={323}
            height={81}
            priority
            className="h-16 w-auto"
          />
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-4xl font-semibold text-balance text-white">
              Key Questions Navigator
            </h1>
            <p className="mx-auto max-w-xs text-center text-base text-white/70">
              Ask the right questions. Prioritize. Take action.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 bg-background px-4 py-16">
        <Image
          src="/goalkeep-logo.png"
          alt="Goalkeep"
          width={323}
          height={81}
          className="h-10 w-auto lg:hidden"
        />
        <div className="flex w-full max-w-[440px] flex-col items-center gap-1.5 text-center">
          <h2 className="text-xl font-semibold">Sign in to continue</h2>
          <p className="text-sm text-muted-foreground">Key Questions Navigator</p>
        </div>
        <SignInForm />
      </div>
    </main>
  )
}
