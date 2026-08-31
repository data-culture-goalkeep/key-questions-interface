import { ProjectDataProvider } from "./project-data-provider"
import { ProjectHeader } from "./project-header"

// No Supabase calls here at all — project + user identity now live in the
// same client-side cache as the key-question data (ProjectDataProvider), so
// this layout does zero server work on every view switch. Only the route
// param unwrap runs per navigation.
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params

  return (
    <ProjectDataProvider projectSlug={projectSlug}>
      <div className="flex flex-1 flex-col">
        <ProjectHeader projectSlug={projectSlug} />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </div>
      </div>
    </ProjectDataProvider>
  )
}
