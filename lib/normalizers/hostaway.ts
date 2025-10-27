import { type ListingAggregate, type NormalizedReview } from '@/lib/types'

export function toTenScale(
  value: number | null | undefined,
  scale: 5 | 10 | null,
): number | null {
  if (value == null || Number.isNaN(value)) return null
  if (!scale) return null
  if (scale === 10) return clamp(value, 0, 10)
  if (scale === 5) return clamp((value / 5) * 10, 0, 10)
  return null
}

export function normalizeHostaway(raw: any[]): NormalizedReview[] {
  if (!Array.isArray(raw)) return []
  return raw.map((r) => {
    const ratingOverall = toTenScale(r?.rating ?? null, r?.ratingScale ?? 10)
    const ratingItems: Record<string, number> | null = Array.isArray(r?.reviewCategory)
      ? Object.fromEntries(
          r.reviewCategory
            .filter((c: any) => typeof c?.category === 'string')
            .map((c: any) => [String(c.category), toTenScale(c?.rating ?? null, 10)])
            .filter(([, v]: [string, number | null]) => v != null),
        )
      : null

    const submittedAtIso = r?.submittedAt
      ? new Date(r.submittedAt.replace(' ', 'T') + 'Z').toISOString()
      : null

    return {
      source: 'hostaway',
      sourceReviewId: r?.id != null ? String(r.id) : null,
      listingName: r?.listingName ?? 'Unknown Listing',
      listingHostawayId: r?.listingId ?? null,
      type: r?.type ?? null,
      status: r?.status ?? null,
      ratingOverall,
      ratingItems: ratingItems && Object.keys(ratingItems).length ? ratingItems : null,
      publicText: r?.publicReview ?? null,
      submittedAt: submittedAtIso,
      authorName: r?.guestName ?? null,
      channel: r?.channel ?? 'Hostaway',
    }
  })
}

export function computeListingAggregates(reviews: NormalizedReview[]): ListingAggregate {
  const allRatings = reviews.map((r) => r.ratingOverall).filter((v): v is number => v != null)
  const avg = allRatings.length ? average(allRatings) : null
  const approvedRatings = allRatings // approval handled at DB/API layer; here treat same set
  const avgApproved = approvedRatings.length ? average(approvedRatings) : null

  const byChannel: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const r of reviews) {
    const ch = r.channel ?? 'Unknown'
    byChannel[ch] = (byChannel[ch] ?? 0) + 1
    const ty = r.type ?? 'unknown'
    byType[ty] = (byType[ty] ?? 0) + 1
  }

  const issues = extractIssues(reviews)

  return {
    avgRatingAll: avg,
    avgRatingApproved: avgApproved,
    reviewCounts: {
      total: reviews.length,
      approved: 0, // set in API layer when we know approvals
      byChannel,
      byType,
    },
    recentIssues: issues,
  }
}

export function extractIssues(reviews: NormalizedReview[]): string[] {
  const sums: Record<string, { total: number; count: number }> = {}
  for (const r of reviews) {
    if (!r.ratingItems) continue
    for (const [k, v] of Object.entries(r.ratingItems)) {
      if (v == null) continue
      if (!sums[k]) sums[k] = { total: 0, count: 0 }
      sums[k].total += v
      sums[k].count += 1
    }
  }

  const avgs = Object.entries(sums)
    .map(([k, { total, count }]) => ({ k, avg: total / Math.max(count, 1), count }))
    .filter((i) => i.count >= 2) // only recurring
    .sort((a, b) => a.avg - b.avg)

  return avgs.slice(0, 3).map((i) => i.k)
}

function average(arr: number[]): number {
  return Math.round((arr.reduce((a, b) => a + b, 0) / Math.max(arr.length, 1)) * 100) / 100
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

