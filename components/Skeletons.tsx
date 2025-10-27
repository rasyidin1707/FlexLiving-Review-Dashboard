export function CardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-16 animate-pulse bg-muted" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return <div className="card h-[280px] animate-pulse bg-muted" />
}

export function TableSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 w-48 bg-muted" />
      <div className="mt-3 space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 bg-muted" />
        ))}
      </div>
    </div>
  )
}

