type Props = {
  name: string
  total: number
  approved: number
  avgAll: number | null
  avgApproved: number | null
  onClick?: () => void
}

export function ListingCard({ name, total, approved, avgAll, avgApproved, onClick }: Props) {
  return (
    <button className="card w-full text-left hover:shadow" onClick={onClick} aria-label={name}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">
            {approved}/{total} approved
          </div>
        </div>
        <div className="text-right text-sm">
          <div>Avg (all): {avgAll ?? '—'}</div>
          <div>Avg (approved): {avgApproved ?? '—'}</div>
        </div>
      </div>
    </button>
  )
}

