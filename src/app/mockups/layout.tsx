import "./mockups.css"

export const metadata = {
  title: "Mockup Navigator",
  description:
    "Walk through dashboard mockups and capture review feedback — no sign-in required.",
}

// Self-contained shell for the Mockup Navigator app. No auth, no Supabase in
// this layout, no ProjectDataProvider — everything is namespaced under
// `.mockup-nav` (see mockups.css) so its design language never collides with
// the KQ Navigator brand theme.
export default function MockupNavigatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="mockup-nav">{children}</div>
}
