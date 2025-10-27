import { prisma } from '@/lib/db'

export async function getListingAggregates(listingId: string) {
  const reviews = await prisma.review.findMany({
    where: { listingId },
    select: { ratingOverall: true, approved: true, channel: true, type: true, ratingItems: true },
  })

  const allRatings = reviews.map((r) => r.ratingOverall).filter((v): v is number => v != null)
  const avgAll = allRatings.length ? avg(allRatings) : null
  const approvedRatings = reviews
    .filter((r) => r.approved)
    .map((r) => r.ratingOverall)
    .filter((v): v is number => v != null)
  const avgApproved = approvedRatings.length ? avg(approvedRatings) : null

  const byChannel: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const r of reviews) {
    const ch = r.channel ?? 'Unknown'
    byChannel[ch] = (byChannel[ch] ?? 0) + 1
    const ty = r.type ?? 'unknown'
    byType[ty] = (byType[ty] ?? 0) + 1
  }

  const categoryScores: Record<string, { total: number; count: number }> = {}
  for (const r of reviews) {
    const items = r.ratingItems ? (JSON.parse(String(r.ratingItems)) as Record<string, number>) : null
    if (!items) continue
    for (const [k, v] of Object.entries(items)) {
      if (v == null) continue
      if (!categoryScores[k]) categoryScores[k] = { total: 0, count: 0 }
      categoryScores[k].total += v
      categoryScores[k].count += 1
    }
  }
  const recentIssues = Object.entries(categoryScores)
    .map(([k, v]) => ({ k, avg: v.total / v.count, count: v.count }))
    .filter((x) => x.count >= 2)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3)
    .map((x) => x.k)

  return {
    avgRatingAll: avgAll,
    avgRatingApproved: avgApproved,
    reviewCounts: {
      total: reviews.length,
      approved: reviews.filter((r) => r.approved).length,
      byChannel,
      byType,
    },
    recentIssues,
  }
}

function avg(arr: number[]) {
  return Math.round((arr.reduce((a, b) => a + b, 0) / Math.max(arr.length, 1)) * 100) / 100
}
