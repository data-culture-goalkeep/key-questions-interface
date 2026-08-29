import { SignInForm } from "./sign-in-form"

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-xl font-semibold">Key Questions Navigator</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue</p>
      </div>
      <SignInForm />
    </main>
  )
}
