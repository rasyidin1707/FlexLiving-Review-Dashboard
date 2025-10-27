import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing) return <div className="text-red-600">Listing not found</div>
  const reviews = await prisma.review.findMany({
    where: { listingId: listing.id, approved: true },
    orderBy: { submittedAt: 'desc' },
  })

  const avg = (() => {
    const arr = reviews.map((r) => r.ratingOverall).filter((v): v is number => v != null)
    if (!arr.length) return null
    return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100
  })()
  const categoryTotals: Record<string, { total: number; count: number }> = {}
  for (const r of reviews) {
    const items = r.ratingItems ? (JSON.parse(String(r.ratingItems)) as Record<string, number>) : null
    if (!items) continue
    for (const [k, v] of Object.entries(items)) {
      if (!categoryTotals[k]) categoryTotals[k] = { total: 0, count: 0 }
      categoryTotals[k].total += v
      categoryTotals[k].count += 1
    }
  }
  const categoryAvg = Object.fromEntries(
    Object.entries(categoryTotals).map(([k, v]) => [k, Math.round((v.total / v.count) * 100) / 100]),
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted p-6">
        <h1 className="text-2xl font-semibold">{listing.name}</h1>
        <p className="text-muted-foreground">Modern property layout with gallery and details.</p>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Guest Reviews</h2>
          <Link className="btn btn-secondary" href="/dashboard">
            Open Dashboard
          </Link>
        </div>
        <div className="card flex items-center gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Average rating</div>
            <div className="text-2xl font-semibold">{avg ?? '—'}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryAvg).map(([k, v]) => (
              <span key={k} className={`rounded px-2 py-1 text-sm ${colorForScore(v)}`}>
                {k}: {v}
              </span>
            ))}
          </div>
        </div>
        {reviews.length === 0 ? (
          <div className="card text-muted-foreground">No reviews selected yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviews.map((r) => (
              <article key={r.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium">{r.authorName ?? 'Guest'}</div>
                  <div className={`rounded-md px-2 py-0.5 text-sm ${colorForScore(r.ratingOverall ?? 0)}`}>
                    {r.ratingOverall ?? '—'}/10
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {r.submittedAt ? r.submittedAt.toLocaleDateString() : ''}
                </div>
                <p className="mt-2 whitespace-pre-wrap">{r.publicText}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function colorForScore(v: number) {
  if (v >= 8) return 'bg-green-100 text-green-800'
  if (v >= 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
