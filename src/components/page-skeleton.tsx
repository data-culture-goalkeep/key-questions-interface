export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
