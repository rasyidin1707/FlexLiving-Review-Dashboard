import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'node:fs'
import path from 'node:path'
import { normalizeHostaway } from '@/lib/normalizers/hostaway'
import type { ReviewsResponse } from '@/lib/types'
import { getListingAggregates } from '@/lib/analytics'

export async function GET() {
  // Load mock data from file and normalize
  const file = path.join(process.cwd(), 'data', 'hostaway-mock.json')
  const raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
  const normalized = normalizeHostaway(raw)

  // Upsert listings and reviews (idempotent by source+sourceReviewId)
  const listingIdByName = new Map<string, string>()
  for (const n of normalized) {
    if (!listingIdByName.has(n.listingName)) {
      const listing = await prisma.listing.upsert({
        where: { name: n.listingName },
        update: {},
        create: {
          name: n.listingName,
          hostawayId: n.listingHostawayId ?? undefined,
          channel: 'Hostaway',
        },
      })
      listingIdByName.set(n.listingName, listing.id)
    }
  }

  for (const n of normalized) {
    const listingId = listingIdByName.get(n.listingName)!
    const externalKey = `${n.source}:${n.sourceReviewId ?? ''}`
    await prisma.review.upsert({
      where: { externalKey },
      update: {
        listingId,
        type: n.type ?? undefined,
        status: n.status ?? undefined,
        ratingOverall: n.ratingOverall ?? undefined,
        ratingItems: n.ratingItems ? JSON.stringify(n.ratingItems) : undefined,
        publicText: n.publicText ?? undefined,
        submittedAt: n.submittedAt ? new Date(n.submittedAt) : undefined,
        authorName: n.authorName ?? undefined,
        channel: n.channel ?? undefined,
      },
      create: {
        source: n.source,
        sourceReviewId: n.sourceReviewId,
        externalKey,
        listingId,
        type: n.type,
        status: n.status,
        ratingOverall: n.ratingOverall,
        ratingItems: n.ratingItems ? JSON.stringify(n.ratingItems) : null,
        publicText: n.publicText,
        submittedAt: n.submittedAt ? new Date(n.submittedAt) : null,
        authorName: n.authorName,
        channel: n.channel,
        approved: false,
      },
    })
  }

  const listings = await prisma.listing.findMany({ orderBy: { name: 'asc' } })
  const reviews = await prisma.review.findMany({
    include: { listing: true },
    orderBy: { submittedAt: 'desc' },
  })

  const listingsPayload: ReviewsResponse['listings'] = []
  for (const l of listings) {
    const agg = await getListingAggregates(l.id)
    listingsPayload.push({
      listingId: l.id,
      listingName: l.name,
      avgRating: agg.avgRatingAll, // alias to keep compatibility
      avgRatingAll: agg.avgRatingAll,
      avgRatingApproved: agg.avgRatingApproved,
      reviewCounts: agg.reviewCounts,
      recentIssues: agg.recentIssues,
    })
  }

  const reviewsPayload: ReviewsResponse['reviews'] = reviews.map((r) => ({
    id: r.id,
    source: r.source as 'hostaway',
    sourceReviewId: r.sourceReviewId,
    listingId: r.listingId,
    listingName: r.listing.name,
    type: r.type,
    status: r.status,
    channel: r.channel,
    ratingOverall: r.ratingOverall,
    ratingItems: r.ratingItems ? (JSON.parse(String(r.ratingItems)) as any) : null,
    publicText: r.publicText,
    submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
    authorName: r.authorName,
    approved: r.approved,
  }))

  const payload: ReviewsResponse = {
    status: 'success',
    listings: listingsPayload,
    reviews: reviewsPayload,
  }

  return NextResponse.json(payload)
}
