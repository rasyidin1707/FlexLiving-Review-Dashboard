import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getListingAggregates } from '@/lib/analytics'

export async function GET() {
  const listings = await prisma.listing.findMany({ orderBy: { name: 'asc' } })
  const result = [] as any[]
  for (const l of listings) {
    const agg = await getListingAggregates(l.id)
    result.push({
      listingId: l.id,
      listingName: l.name,
      avgRatingAll: agg.avgRatingAll,
      avgRatingApproved: agg.avgRatingApproved,
      reviewCounts: agg.reviewCounts,
      recentIssues: agg.recentIssues,
    })
  }
  return NextResponse.json({ items: result })
}

