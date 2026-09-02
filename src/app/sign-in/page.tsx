import Image from "next/image"

import { SignInForm } from "./sign-in-form"

export default function SignInPage() {
  return (
    <main className="grid min-h-svh flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-gk-ink px-10 py-16 lg:flex">
        <BrandRing />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <Image
            src="/goalkeep-logo-reverse.png"
            alt="Goalkeep"
            width={232}
            height={80}
            priority
            className="h-9 w-auto"
          />
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl font-semibold text-white text-balance">
              Key Questions Navigator
            </h1>
            <p className="max-w-2xs text-sm text-white/70">
              Ask the right questions. Prioritize. Take action.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 bg-background px-4 py-16">
        <Image
          src="/goalkeep-logo.png"
          alt="Goalkeep"
          width={232}
          height={80}
          className="h-7 w-auto lg:hidden"
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

// A faint echo of the logomark's own circle-of-arcs, blown up as a
// background flourish behind the brand panel — deliberately literal rather
// than a generic gradient, per the redesign brief.
function BrandRing() {
  return (
    <svg
      viewBox="0 0 440 440"
      className="pointer-events-none absolute top-1/2 left-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]"
      aria-hidden="true"
    >
      <path
        d="M 220 40 A 180 180 0 0 1 397.3 188.8"
        fill="none"
        stroke="#E9E626"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M 400 220 A 180 180 0 0 1 251.2 397.3"
        fill="none"
        stroke="#EA9D93"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M 220 400 A 180 180 0 0 1 42.7 251.2"
        fill="none"
        stroke="#81C2B2"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M 40 220 A 180 180 0 0 1 188.8 42.7"
        fill="none"
        stroke="#4E72B8"
        strokeWidth="34"
        strokeLinecap="round"
      />
    </svg>
  )
}
