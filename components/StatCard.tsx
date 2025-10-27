type Props = {
  title: string
  value: string | number
  onClick?: () => void
}

export function StatCard({ title, value, onClick }: Props) {
  return (
    <button className="card w-full text-left hover:shadow-md hover:scale-[1.01] transition-transform duration-150" onClick={onClick} aria-label={title}>
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </button>
  )
}
